-- Shoppers can rate and review a product straight from its page.
-- Apply after 001_initial_schema.sql.

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  author_name text not null check (char_length(btrim(author_name)) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  body text check (body is null or char_length(body) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_idx
  on public.product_reviews (product_id, created_at desc);

alter table public.product_reviews enable row level security;

revoke all on public.product_reviews from anon, authenticated;
grant select, insert on public.product_reviews to anon, authenticated;
grant delete on public.product_reviews to authenticated;

-- Published reviews are public; anyone can leave one for an active product.
create policy "product_reviews_public_read" on public.product_reviews
for select to anon, authenticated using (true);

create policy "product_reviews_public_insert" on public.product_reviews
for insert to anon, authenticated
with check (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.is_active
  )
);

-- Admins can remove reviews that should not be shown.
create policy "product_reviews_admin_delete" on public.product_reviews
for delete to authenticated using ((select public.is_admin()));
