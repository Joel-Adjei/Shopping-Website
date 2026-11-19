import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const expectedInternalKey = Deno.env.get('INTERNAL_FUNCTION_KEY')
  if (!expectedInternalKey || req.headers.get('x-internal-function-key') !== expectedInternalKey) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const body = await req.json()
    const orderId = String(body?.order_id ?? '')
    const adminRecipient = Deno.env.get('WHATSAPP_ADMIN_RECIPIENT') ?? String(body?.admin_recipient ?? '')
    const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const templateName = Deno.env.get('WHATSAPP_ORDER_TEMPLATE') ?? 'new_order_notification'
    const languageCode = Deno.env.get('WHATSAPP_TEMPLATE_LANGUAGE') ?? 'en'
    if (!orderId || !adminRecipient || !token || !phoneNumberId) {
      return json({ error: 'WhatsApp integration is not configured.' }, 503)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const { data: order, error: orderError } = await client.from('orders')
      .select('id,order_number,customer_name,customer_phone,customer_email,delivery_address,notes,subtotal,delivery_fee,total,currency,payment_method,payment_status,order_status,order_items(product_name,selected_size,selected_color,customization_text,quantity,unit_price,line_total)')
      .eq('id', orderId).single()
    if (orderError || !order) throw orderError ?? new Error('Order not found.')

    const address = order.delivery_address as { line1?: string; city?: string; country?: string }
    const items = (order.order_items ?? []).map((item: { product_name: string; selected_size: string; selected_color: string; customization_text: string | null; quantity: number; unit_price: number; line_total: number }) =>
      `${item.product_name} (${item.selected_size}, ${item.selected_color}${item.customization_text ? `, “${item.customization_text}”` : ''}) x${item.quantity} — ${order.currency} ${Number(item.line_total).toFixed(2)}`
    )
    const itemSummary = items.join('\n').slice(0, 900)
    const fullAddress = [address?.line1, address?.city, address?.country].filter(Boolean).join(', ')
    const templateParameters = [
      order.order_number,
      order.customer_name,
      order.customer_phone,
      itemSummary,
      `${order.currency} ${Number(order.subtotal).toFixed(2)}`,
      `${order.currency} ${Number(order.delivery_fee).toFixed(2)}`,
      `${order.currency} ${Number(order.total).toFixed(2)}`,
      fullAddress.slice(0, 250),
      String(order.payment_method).replaceAll('_', ' '),
      order.payment_status,
    ]

    // Configure this approved WhatsApp template with ten BODY text parameters in this exact order.
    const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: adminRecipient,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [{
            type: 'body',
            parameters: templateParameters.map((text) => ({ type: 'text', text: String(text || '—') })),
          }],
        },
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      await client.from('notification_logs').update({
        status: 'failed', attempt_count: 1, last_error: JSON.stringify(result).slice(0, 1500),
      }).eq('order_id', orderId).eq('channel', 'whatsapp')
      return json({ error: 'WhatsApp provider rejected the message.', provider: result }, 502)
    }

    const providerMessageId = result?.messages?.[0]?.id ?? null
    await client.from('notification_logs').update({
      status: 'sent', attempt_count: 1, provider_message_id: providerMessageId,
      sent_at: new Date().toISOString(), last_error: null,
    }).eq('order_id', orderId).eq('channel', 'whatsapp')

    return json({ status: 'sent', provider_message_id: providerMessageId })
  } catch (error) {
    console.error('send-order-notification error', error)
    return json({ error: 'Unable to send WhatsApp notification.' }, 500)
  }
})
