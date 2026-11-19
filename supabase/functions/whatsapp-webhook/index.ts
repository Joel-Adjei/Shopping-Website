import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN')

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    if (mode === 'subscribe' && verifyToken && token === verifyToken && challenge) {
      return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // Production hardening TODO: verify X-Hub-Signature-256 against WHATSAPP_APP_SECRET
  // using the raw request body before accepting status events.
  const payload = await req.json()
  const statuses = (payload?.entry ?? [])
    .flatMap((entry: any) => entry.changes ?? [])
    .flatMap((change: any) => change.value?.statuses ?? [])

  if (statuses.length) {
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false },
    })
    for (const item of statuses) {
      const providerId = item.id
      const state = item.status
      const mapped = state === 'read' ? 'read' : state === 'delivered' ? 'delivered' : state === 'sent' ? 'sent' : state === 'failed' ? 'failed' : null
      if (!providerId || !mapped) continue
      const patch: Record<string, unknown> = { status: mapped }
      if (mapped === 'delivered') patch.delivered_at = new Date().toISOString()
      if (mapped === 'failed') patch.last_error = JSON.stringify(item.errors ?? []).slice(0, 1500)
      await client.from('notification_logs').update(patch).eq('provider_message_id', providerId)
    }
  }
  return json({ received: true })
})
