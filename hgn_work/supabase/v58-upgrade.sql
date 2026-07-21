-- HGN v58 — Media + Google News SEO hardening
-- Safe additive migration. Run in Supabase SQL Editor.

alter table articles add column if not exists seo_title text;
alter table articles add column if not exists meta_description text;
alter table articles add column if not exists canonical_url text;
alter table articles add column if not exists social_title text;
alter table articles add column if not exists social_description text;
alter table articles add column if not exists og_image_url text;
alter table articles add column if not exists image_alt text;
alter table articles add column if not exists image_caption text;
alter table articles add column if not exists image_credit text;
alter table articles add column if not exists updated_at timestamptz default now();
alter table articles add column if not exists google_news_include boolean default true;
alter table articles add column if not exists section text;

update articles
set updated_at = coalesce(updated_at, published_at, created_at, now())
where updated_at is null;

update articles
set meta_description = left(regexp_replace(coalesce(excerpt, ''), '<[^>]*>', '', 'g'), 155)
where (meta_description is null or trim(meta_description) = '')
  and excerpt is not null;

update articles
set og_image_url = image_url
where (og_image_url is null or trim(og_image_url) = '')
  and image_url is not null;

create table if not exists publication_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text default 'Haida Gwaii News',
  site_url text default 'https://haidagwaiinews.com',
  google_news_publication_name text default 'Haida Gwaii News',
  default_og_image text,
  updated_at timestamptz default now()
);

insert into publication_settings (site_name, site_url, google_news_publication_name)
select 'Haida Gwaii News', 'https://haidagwaiinews.com', 'Haida Gwaii News'
where not exists (select 1 from publication_settings);

create index if not exists articles_google_news_idx on articles (status, google_news_include, published_at desc);
create index if not exists articles_category_idx on articles (category);
create index if not exists articles_updated_at_idx on articles (updated_at desc);
