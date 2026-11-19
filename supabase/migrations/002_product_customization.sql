-- Product personalisation: selected pieces can be finished with a customer name or brand.
-- Apply after 001_initial_schema.sql.

alter table public.products
  add column if not exists customization_enabled boolean not null default false,
  add column if not exists customization_label text;

-- The customer's text is stored per line so it survives with the order.
alter table public.order_items
  add column if not exists customization_text text;

comment on column public.products.customization_enabled is 'Shows a personalisation text field on the product page.';
comment on column public.products.customization_label is 'Prompt shown above the text field, e.g. "Name or brand to emboss".';
comment on column public.order_items.customization_text is 'Customer-supplied name or brand for personalised lines.';
