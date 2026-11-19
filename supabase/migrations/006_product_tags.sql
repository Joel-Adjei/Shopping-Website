-- Free-form product tags set from the admin product form (multi-select).
-- Apply after 001_initial_schema.sql.

alter table public.products
  add column if not exists tags text[] not null default '{}';

create index if not exists products_tags_idx on public.products using gin (tags);

comment on column public.products.tags is 'Shopper-facing labels such as New in, Bestseller or Handmade.';
