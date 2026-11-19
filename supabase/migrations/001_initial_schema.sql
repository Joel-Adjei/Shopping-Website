-- ATELIER fashion store: initial schema.
-- Apply through Supabase CLI migrations or the SQL Editor in a development project.
-- Security note: public clients may read active catalogue data. Orders are created through
-- the create-order Edge Function, not by directly inserting into these tables from the browser.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'customer');
create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.payment_method as enum ('cash_on_delivery', 'mobile_money_manual', 'online');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  sku text unique,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  image_url text,
  images jsonb not null default '[]'::jsonb,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  stock_quantity integer not null default 0 check (stock_quantity >= 0), 
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address jsonb not null,
  notes text,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  currency text not null default 'GHS' check (currency = 'GHS'),
  payment_method public.payment_method not null default 'cash_on_delivery',
  payment_status public.payment_status not null default 'pending',
  order_status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_sku text,
  image_url text,
  selected_size text not null default 'One size',
  selected_color text not null default 'Default',
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  channel text not null default 'whatsapp' check (channel in ('whatsapp')),
  status text not null default 'queued' check (status in ('queued','sent','delivered','read','failed')),
  provider_message_id text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'ATELIER',
  currency text not null default 'GHS',
  free_delivery_threshold numeric(12,2) not null default 1000,
  standard_delivery_fee numeric(12,2) not null default 25,
  support_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

create index products_active_created_idx on public.products (is_active, created_at desc);
create index products_category_idx on public.products (category_id);
create index orders_created_idx on public.orders (created_at desc);
create index orders_status_created_idx on public.orders (order_status, created_at desc);
create index orders_customer_user_idx on public.orders (customer_user_id);
create index order_items_order_idx on public.order_items (order_id);
create index notification_logs_order_idx on public.notification_logs (order_id, created_at desc);

-- Keep profile records synchronized with Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();
create trigger categories_updated_at before update on public.categories
for each row execute procedure public.set_updated_at();
create trigger products_updated_at before update on public.products
for each row execute procedure public.set_updated_at();
create trigger orders_updated_at before update on public.orders
for each row execute procedure public.set_updated_at();
create trigger notification_logs_updated_at before update on public.notification_logs
for each row execute procedure public.set_updated_at();
create trigger store_settings_updated_at before update on public.store_settings
for each row execute procedure public.set_updated_at();

-- Admin checks are based on a profile role, not user-editable auth metadata.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- RLS enabled for every exposed table.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notification_logs enable row level security;
alter table public.store_settings enable row level security;

-- Start with explicit grants; policies further restrict rows.
revoke all on public.profiles, public.categories, public.products, public.orders,
  public.order_items, public.notification_logs, public.store_settings from anon, authenticated;

grant select on public.categories, public.products, public.store_settings to anon, authenticated;
grant select on public.profiles to authenticated;
-- Restrict browser profile edits to harmless profile fields. In particular, users
-- cannot update their own role column through the Data API.
grant update (full_name, phone) on public.profiles to authenticated;
grant select, insert, update, delete on public.categories, public.products to authenticated;
grant select on public.orders, public.order_items, public.notification_logs to authenticated;

-- Profiles: users can view/update their own profile. Admin can view all.
create policy "profiles_select_own_or_admin" on public.profiles
for select to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

create policy "profiles_update_own_or_admin" on public.profiles
for update to authenticated
using ((select auth.uid()) = id or (select public.is_admin()))
with check ((select auth.uid()) = id or (select public.is_admin()));

-- Categories: public sees active categories, admins manage all.
create policy "categories_public_read_active" on public.categories
for select to anon, authenticated
using (is_active or (select public.is_admin()));
create policy "categories_admin_insert" on public.categories
for insert to authenticated with check ((select public.is_admin()));
create policy "categories_admin_update" on public.categories
for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories_admin_delete" on public.categories
for delete to authenticated using ((select public.is_admin()));

-- Products: public sees active products, admins manage catalogue.
create policy "products_public_read_active" on public.products
for select to anon, authenticated
using (is_active or (select public.is_admin()));
create policy "products_admin_insert" on public.products
for insert to authenticated with check ((select public.is_admin()));
create policy "products_admin_update" on public.products
for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products_admin_delete" on public.products
for delete to authenticated using ((select public.is_admin()));

-- Store settings are public-read only. Updates must be added to a secure admin workflow if needed.
create policy "store_settings_public_read" on public.store_settings
for select to anon, authenticated using (true);

-- Orders and order items are intentionally not directly insertable/updatable/deletable
-- from browser roles. create-order Edge Function validates the request and writes them
-- with a server-side client. Admins can read order data.
create policy "orders_admin_read" on public.orders
for select to authenticated using ((select public.is_admin()));
create policy "order_items_admin_read" on public.order_items
for select to authenticated using ((select public.is_admin()));
create policy "notification_logs_admin_read" on public.notification_logs
for select to authenticated using ((select public.is_admin()));

-- Set up a public Storage bucket for product images. Public read, admin-only writes.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'product-images');

create policy "product_images_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product_images_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'product-images' and (select public.is_admin()))
with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product_images_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'product-images' and (select public.is_admin()));

-- Seed categories; demo products in the UI are fallback-only until real products are inserted.
insert into public.categories (name, slug, description, sort_order) values
  ('Women', 'women', 'Considered silhouettes for every day.', 1),
  ('Men', 'men', 'Refined staples, built to last.', 2),
  ('Accessories', 'accessories', 'The finishing details.', 3),
  ('Essentials', 'essentials', 'The foundations of a thoughtful wardrobe.', 4),
  ('Shoes', 'shoes', 'A considered step in the right direction.', 5)
on conflict (slug) do nothing;

-- IMPORTANT: create the first admin using Supabase Auth, then promote that user
-- manually from the SQL Editor after confirming the email:
-- update public.profiles set role = 'admin' where id = 'AUTH_USER_UUID';
-- Never allow a browser client to set its own role.
