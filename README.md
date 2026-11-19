# ATELIER — Premium Fashion E-commerce Starter

A React + TypeScript + Tailwind CSS + Supabase starter for a premium fashion store, with an initial WhatsApp Cloud API order-notification integration.

## What's included

- Premium editorial-style storefront with demo fashion products
- Responsive product grid, category filter, sorting and search
- Client-side cart and checkout form
- Admin sign-in screen and recent orders dashboard
- Supabase client configuration
- PostgreSQL schema, indexes, admin role helper, RLS policies and product-image storage policies
- Edge Function drafts for order creation, WhatsApp notification sending and WhatsApp status webhooks

## 1. Run the frontend

Requirements: Node.js 20+ recommended.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Create a project at https://supabase.com/dashboard and fill `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_WHATSAPP_ADMIN_NUMBER=233244000000
```

`VITE_WHATSAPP_ADMIN_NUMBER` is the store's WhatsApp number in international format, digits only. After a successful checkout the shopper is sent to a `wa.me` chat with this number, prefilled with the order number, items, personalisation and totals, and only needs to press send. If it is left blank, checkout still saves the order and uses the Cloud API notification path below.

The frontend falls back to demo catalogue items when Supabase is not configured or the products table is empty. Do not accept real orders until the database and Edge Functions are deployed.

## 2. Apply the database migration

For the simplest initial setup, paste `supabase/migrations/001_initial_schema.sql` into the Supabase SQL Editor and run it on a development project. For a CLI-managed project:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Review policies before production. The migration intentionally does not allow browser clients to insert orders directly. The `create-order` Edge Function writes orders server-side.

## 3. Create the first admin

1. In Supabase Dashboard → Authentication → Users, create the admin user.
2. Copy that user's UUID.
3. In SQL Editor, run:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```

Do not make public sign-up or profile updates capable of assigning `role = 'admin'`.

## 4. Deploy Edge Functions

Install the Supabase CLI and deploy each function:

```bash
npx supabase functions deploy create-order
npx supabase functions deploy send-order-notification
npx supabase functions deploy whatsapp-webhook
```

Configure the WhatsApp secrets in Supabase Dashboard → Edge Function Secrets. Example names:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_ADMIN_RECIPIENT` (international format, digits only)
- `WHATSAPP_ORDER_TEMPLATE` (defaults to `new_order_notification`)
- `WHATSAPP_TEMPLATE_LANGUAGE` (defaults to `en`)
- `INTERNAL_FUNCTION_KEY` (long random secret shared only between create-order and send-order-notification)
- `ALLOWED_ORIGIN` (your deployed storefront origin)

`SUPABASE_URL` and the service-role secret are injected by Supabase in deployed functions. Never place WhatsApp credentials or a Supabase service-role/secret key in a `VITE_` variable or browser code.

## 5. WhatsApp template

The notification function expects an approved template with ten BODY text placeholders in this order:

1. Order number
2. Customer name
3. Customer phone
4. Item summary (product, size, colour, quantity and line total)
5. Subtotal
6. Delivery fee
7. Total
8. Delivery address
9. Payment method
10. Payment status

This is a template contract, not an approved Meta template. Create and get approval for a matching template in WhatsApp Manager, or change the code to match the template you actually approve.

For an existing WhatsApp Business App number, confirm that the number and business are eligible for Meta's supported coexistence onboarding before relying on the API. A personal WhatsApp account cannot simply be connected by scraping WhatsApp Web.

## Important production hardening before launch

This starter is a foundation, not a production-certified commerce system.

- The WhatsApp webhook currently includes a TODO for `X-Hub-Signature-256` verification. Implement signature verification using `WHATSAPP_APP_SECRET` before production.
- Guest checkout is public by design in `supabase/config.toml`; add rate limiting, bot protection/CAPTCHA, abuse monitoring and strict origin configuration before production.
- The order/notification path should be hardened with an outbox/queue and idempotency keys. Do not automatically resend uncertain sends without checking status, as duplicates may occur.
- For high concurrency, stock reservation and order/item creation should run in a single Postgres transaction/RPC function.
- Add rate limiting / bot protection to public order creation, input validation, audit logs and alerting.
- Configure `ALLOWED_ORIGIN` to your exact production origin, not `*`.
- The sample checkout has cash on delivery and manual Mobile Money selection only. Payment status remains pending until independently verified.
- Admin dashboard currently lists orders; add product CRUD, status updates and notification log views as the next feature pass.
- Public order status lookup is not implemented yet; do not expose order records by guessable order number.
- Add RLS policy tests before launch. Review Supabase Storage policies separately from table policies.

## Useful docs

- https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/functions
- https://developers.facebook.com/docs/whatsapp/cloud-api/
