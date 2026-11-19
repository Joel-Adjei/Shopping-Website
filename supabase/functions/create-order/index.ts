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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminRecipient = Deno.env.get('WHATSAPP_ADMIN_RECIPIENT')
    const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const body = await req.json()
    const customer = body?.customer
    const address = body?.address
    const items = body?.items

    if (!customer?.name || !customer?.phone || !address?.line1 || !address?.city || !Array.isArray(items) || items.length === 0) {
      return json({ error: 'Please provide customer details, delivery address and at least one item.' }, 400)
    }
    if (items.length > 30) return json({ error: 'Too many distinct items in one order.' }, 400)

    const normalized = items.map((item: Record<string, unknown>) => ({
      product_id: String(item.product_id ?? ''),
      quantity: Number(item.quantity),
      size: String(item.size ?? 'One size').slice(0, 40),
      color: String(item.color ?? 'Default').slice(0, 60),
      // Sanitised again below; only kept for products that offer personalisation.
      customization: typeof item.customization === 'string'
        ? item.customization.trim().replace(/\s+/g, ' ').slice(0, 40)
        : '',
    }))
    if (normalized.some((item) => !item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50)) {
      return json({ error: 'One or more item quantities are invalid.' }, 400)
    }

    // All prices and product details are read from the database, never trusted from the browser.
    const productIds = [...new Set(normalized.map((item) => item.product_id))]
    const { data: products, error: productsError } = await client
      .from('products')
      .select('id,name,sku,price,image_url,stock_quantity,is_active,sizes,colors,customization_enabled')
      .in('id', productIds)

    if (productsError) throw productsError
    if (!products || products.length !== productIds.length) return json({ error: 'One or more products are no longer available.' }, 400)

    const byId = new Map(products.map((product) => [product.id, product]))
    let subtotal = 0
    const orderItems = []

    for (const item of normalized) {
      const product = byId.get(item.product_id)
      if (!product || !product.is_active) return json({ error: 'One or more products are no longer available.' }, 400)
      if (item.quantity > product.stock_quantity) return json({ error: `${product.name} does not have enough stock.` }, 409)
      if (product.sizes?.length && !product.sizes.includes(item.size)) return json({ error: `Invalid size selected for ${product.name}.` }, 400)
      if (product.colors?.length && !product.colors.includes(item.color)) return json({ error: `Invalid color selected for ${product.name}.` }, 400)
      const unitPrice = Number(product.price)
      subtotal += unitPrice * item.quantity
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        image_url: product.image_url,
        selected_size: item.size,
        selected_color: item.color,
        customization_text: product.customization_enabled && item.customization ? item.customization : null,
        quantity: item.quantity,
        unit_price: unitPrice,
      })
    }

    const { data: settings } = await client.from('store_settings').select('free_delivery_threshold,standard_delivery_fee').eq('id', 1).maybeSingle()
    const deliveryFee = subtotal >= Number(settings?.free_delivery_threshold ?? 1000) ? 0 : Number(settings?.standard_delivery_fee ?? 25)
    const total = subtotal + deliveryFee
    const orderNumber = `AT-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    const authHeader = req.headers.get('Authorization')
    let customerUserId: string | null = null
    if (authHeader?.startsWith('Bearer ')) {
      const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      })
      const { data: userData } = await userClient.auth.getUser()
      customerUserId = userData.user?.id ?? null
    }

    const paymentMethod = ['cash_on_delivery', 'mobile_money_manual', 'online'].includes(body.payment_method)
      ? body.payment_method : 'cash_on_delivery'

    const { data: order, error: orderError } = await client.from('orders').insert({
      order_number: orderNumber,
      customer_user_id: customerUserId,
      customer_name: String(customer.name).trim().slice(0, 120),
      customer_phone: String(customer.phone).trim().slice(0, 40),
      customer_email: customer.email ? String(customer.email).trim().slice(0, 254) : null,
      delivery_address: {
        line1: String(address.line1).trim().slice(0, 250),
        city: String(address.city).trim().slice(0, 100),
        country: 'Ghana',
      },
      notes: body.notes ? String(body.notes).trim().slice(0, 1000) : null,
      subtotal, delivery_fee: deliveryFee, total, payment_method: paymentMethod,
      payment_status: 'pending', order_status: 'pending',
    }).select('id,order_number,total,created_at').single()

    if (orderError || !order) throw orderError ?? new Error('Order could not be created.')

    const { error: itemsError } = await client.from('order_items').insert(orderItems.map((item) => ({ ...item, order_id: order.id })))
    if (itemsError) {
      await client.from('orders').delete().eq('id', order.id)
      throw itemsError
    }

    // Notification is deliberately attempted after the order is persisted.
    // Failure to notify must not erase a valid order.
    let notification = 'queued'
    try {
      const { error: logError } = await client.from('notification_logs').insert({ order_id: order.id, status: 'queued' })
      if (logError) throw logError
      const internalFunctionKey = Deno.env.get('INTERNAL_FUNCTION_KEY')
      if (!internalFunctionKey) throw new Error('INTERNAL_FUNCTION_KEY is not configured.')
      const notifyResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'x-internal-function-key': internalFunctionKey,
        },
        body: JSON.stringify({ order_id: order.id, admin_recipient: adminRecipient }),
      })
      if (!notifyResponse.ok) throw new Error(`Notification function returned ${notifyResponse.status}`)
      notification = 'queued'
    } catch (error) {
      console.error('Order saved, but WhatsApp notification could not be queued:', error)
      notification = 'failed'
    }

    return json({ order_number: order.order_number, total: order.total, notification_status: notification }, 201)
  } catch (error) {
    console.error('create-order error', error)
    return json({ error: 'We could not process your order right now. Please try again.' }, 500)
  }
})
