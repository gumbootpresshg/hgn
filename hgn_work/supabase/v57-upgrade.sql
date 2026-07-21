-- HGN v57 Media Pipeline / Image Metadata Upgrade
-- Safe additive migration. Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text default 'article-images',
  original_filename text,
  storage_path text,
  public_url text,
  thumbnail_url text,
  web_url text,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  caption text,
  credit text,
  alt_text text,
  usage_type text default 'article',
  uploaded_by uuid,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists article_images (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  media_asset_id uuid references media_assets(id) on delete set null,
  image_url text,
  thumbnail_url text,
  caption text,
  credit text,
  alt_text text,
  sort_order integer default 0,
  is_featured boolean default false,
  created_at timestamptz default now()
);

alter table articles add column if not exists image_caption text;
alter table articles add column if not exists image_credit text;
alter table articles add column if not exists image_alt text;
alter table articles add column if not exists featured_media_id uuid;
alter table articles add column if not exists updated_at timestamptz default now();

-- Backfill existing article.image_url rows into article_images so old imports still display.
insert into article_images (article_id, image_url, caption, credit, alt_text, is_featured, sort_order)
select id, image_url, image_caption, image_credit, coalesce(image_alt, title), true, 0
from articles
where image_url is not null
  and trim(image_url) <> ''
  and not exists (
    select 1 from article_images ai where ai.article_id = articles.id and ai.image_url = articles.image_url
  );

-- Storage buckets. If these fail due to permissions, create them manually in Supabase Storage.
insert into storage.buckets (id, name, public)
values
  ('article-images', 'article-images', true),
  ('marketplace-images', 'marketplace-images', true),
  ('obituary-images', 'obituary-images', true),
  ('event-images', 'event-images', true),
  ('ad-images', 'ad-images', true)
on conflict (id) do nothing;

alter table media_assets enable row level security;
alter table article_images enable row level security;

drop policy if exists "Public can read media assets" on media_assets;
create policy "Public can read media assets"
on media_assets for select using (true);

drop policy if exists "Public can read article images" on article_images;
create policy "Public can read article images"
on article_images for select using (true);

drop policy if exists "Authenticated can manage media assets" on media_assets;
create policy "Authenticated can manage media assets"
on media_assets for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated can manage article images" on article_images;
create policy "Authenticated can manage article images"
on article_images for all to authenticated using (true) with check (true);

-- Public storage read policy.
drop policy if exists "Public can read article image files" on storage.objects;
create policy "Public can read article image files"
on storage.objects for select
using (bucket_id in ('article-images','marketplace-images','obituary-images','event-images','ad-images'));

-- Authenticated upload policy.
drop policy if exists "Authenticated can upload HGN media" on storage.objects;
create policy "Authenticated can upload HGN media"
on storage.objects for insert to authenticated
with check (bucket_id in ('article-images','marketplace-images','obituary-images','event-images','ad-images'));

-- Service/admin update policy.
drop policy if exists "Authenticated can update HGN media" on storage.objects;
create policy "Authenticated can update HGN media"
on storage.objects for update to authenticated
using (bucket_id in ('article-images','marketplace-images','obituary-images','event-images','ad-images'))
with check (bucket_id in ('article-images','marketplace-images','obituary-images','event-images','ad-images'));
