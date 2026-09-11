-- HGN v0.49.0: independent front-page photo controls
-- Run in Supabase SQL Editor before deploying this release.

alter table public.articles
  add column if not exists front_page_photo boolean not null default false,
  add column if not exists image_alt text,
  add column if not exists image_caption text,
  add column if not exists image_credit text;

create index if not exists articles_front_page_photo_idx
  on public.articles (front_page_photo, published_at desc)
  where front_page_photo = true and status = 'published';

comment on column public.articles.front_page_photo is
  'Selects this article image as the independent homepage front-page photo.';
