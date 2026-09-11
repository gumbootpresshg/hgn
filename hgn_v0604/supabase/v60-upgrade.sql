-- HGN v60 Social + SEO Ops safe upgrade
-- Safe to run multiple times.

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  platform text,
  post_text text,
  image_url text,
  posted boolean default false,
  posted_at timestamptz,
  created_at timestamptz default now()
);

alter table social_posts add column if not exists article_id uuid;
alter table social_posts add column if not exists platform text;
alter table social_posts add column if not exists post_text text;
alter table social_posts add column if not exists image_url text;
alter table social_posts add column if not exists posted boolean default false;
alter table social_posts add column if not exists posted_at timestamptz;
alter table social_posts add column if not exists created_at timestamptz default now();

create table if not exists article_seo (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_url text,
  created_at timestamptz default now()
);

alter table article_seo add column if not exists article_id uuid;
alter table article_seo add column if not exists seo_title text;
alter table article_seo add column if not exists seo_description text;
alter table article_seo add column if not exists canonical_url text;
alter table article_seo add column if not exists og_image_url text;
alter table article_seo add column if not exists created_at timestamptz default now();

create table if not exists article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  title text,
  body text,
  editor_email text,
  notes text,
  created_at timestamptz default now()
);

alter table article_revisions add column if not exists article_id uuid;
alter table article_revisions add column if not exists title text;
alter table article_revisions add column if not exists body text;
alter table article_revisions add column if not exists editor_email text;
alter table article_revisions add column if not exists notes text;
alter table article_revisions add column if not exists created_at timestamptz default now();

create table if not exists media_library (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  image_url text,
  thumbnail_url text,
  caption text,
  credit text,
  alt_text text,
  source text,
  created_at timestamptz default now()
);

alter table media_library add column if not exists article_id uuid;
alter table media_library add column if not exists image_url text;
alter table media_library add column if not exists thumbnail_url text;
alter table media_library add column if not exists caption text;
alter table media_library add column if not exists credit text;
alter table media_library add column if not exists alt_text text;
alter table media_library add column if not exists source text;
alter table media_library add column if not exists created_at timestamptz default now();

alter table articles add column if not exists seo_title text;
alter table articles add column if not exists seo_description text;
alter table articles add column if not exists canonical_url text;
alter table articles add column if not exists social_summary text;
alter table articles add column if not exists updated_at timestamptz default now();
alter table articles add column if not exists image_caption text;
alter table articles add column if not exists image_credit text;
alter table articles add column if not exists image_alt text;

-- Starter social post templates / sample rows are not inserted automatically to avoid clutter.
