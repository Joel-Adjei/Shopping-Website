-- Products can carry a gallery of images. The first entry is the cover image.
-- Apply after 001_initial_schema.sql.

alter table public.products
  add column if not exists images text[] not null default '{}';

-- Existing pieces keep their current single image as the cover.
update public.products
set images = array[image_url]
where image_url is not null
  and coalesce(cardinality(images), 0) = 0;

alter table public.products
  drop constraint if exists products_images_max;
alter table public.products
  add constraint products_images_max check (cardinality(images) <= 8);

comment on column public.products.images is 'Gallery image URLs; the first one is the cover shown in listings.';
