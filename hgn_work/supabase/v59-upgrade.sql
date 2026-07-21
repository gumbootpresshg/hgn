-- HGN v59 Publisher Platform - safe/idempotent schema patch

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  platform text,
  post_text text,
  status text default 'draft',
  posted_url text,
  posted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  source text,
  status text default 'subscribed',
  created_at timestamptz default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text,
  path text,
  public_url text,
  thumbnail_url text,
  caption text,
  credit text,
  alt_text text,
  width integer,
  height integer,
  file_size integer,
  mime_type text,
  created_at timestamptz default now()
);

create table if not exists article_images (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  media_asset_id uuid,
  image_url text,
  thumbnail_url text,
  caption text,
  credit text,
  alt_text text,
  sort_order integer default 0,
  is_featured boolean default false,
  created_at timestamptz default now()
);

alter table articles add column if not exists seo_title text;
alter table articles add column if not exists seo_description text;
alter table articles add column if not exists og_image_url text;
alter table articles add column if not exists canonical_url text;
alter table articles add column if not exists updated_at timestamptz default now();
alter table articles add column if not exists google_news_ready boolean default false;
alter table articles add column if not exists social_caption text;
alter table articles add column if not exists image_caption text;
alter table articles add column if not exists image_credit text;
alter table articles add column if not exists image_alt_text text;

alter table ad_placements add column if not exists active boolean default true;
alter table ad_placements add column if not exists click_url text;
alter table ad_placements add column if not exists image_url text;
alter table ad_placements add column if not exists starts_at timestamptz;
alter table ad_placements add column if not exists ends_at timestamptz;
alter table ad_placements add column if not exists priority integer default 0;

create index if not exists articles_status_published_idx on articles(status, published_at desc);
create index if not exists articles_category_published_idx on articles(category, published_at desc);
create index if not exists social_posts_article_idx on social_posts(article_id);
create index if not exists article_images_article_idx on article_images(article_id);
