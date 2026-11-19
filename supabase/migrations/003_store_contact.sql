-- Store contact details shown in the footer, About page and checkout handoff.
-- Apply after 001_initial_schema.sql.

alter table public.store_settings
  add column if not exists contact_phone text default '+233 59 305 4022',
  add column if not exists whatsapp_number text default '233593054022',
  add column if not exists instagram_url text default 'https://www.instagram.com/stylish_steps_collection',
  add column if not exists tiktok_url text default 'https://www.tiktok.com/@stylishstepsfol',
  add column if not exists contact_address text default 'Accra, Ghana';

-- The seed row still carries the starter template's name.
update public.store_settings
set store_name = 'Stylish Steps Collection'
where id = 1 and store_name = 'ATELIER';

-- Store settings were public-read only. Admins can now update the single row.
drop policy if exists "store_settings_admin_update" on public.store_settings;
create policy "store_settings_admin_update" on public.store_settings
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant update on public.store_settings to authenticated;

comment on column public.store_settings.whatsapp_number is 'International format, digits only. Used for wa.me links.';
