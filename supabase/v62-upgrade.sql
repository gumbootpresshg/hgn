create table if not exists launch_checklist (
  id uuid primary key default gen_random_uuid(),
  title text,
  area text,
  item text,
  status text default 'todo',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table launch_checklist add column if not exists title text;
alter table launch_checklist add column if not exists area text;
alter table launch_checklist add column if not exists item text;
alter table launch_checklist add column if not exists status text default 'todo';
alter table launch_checklist add column if not exists notes text;
alter table launch_checklist add column if not exists created_at timestamptz default now();
alter table launch_checklist add column if not exists updated_at timestamptz default now();
alter table launch_checklist alter column title drop not null;

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
  meta_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  created_at timestamptz default now()
);
alter table article_seo add column if not exists article_id uuid;
alter table article_seo add column if not exists meta_title text;
alter table article_seo add column if not exists meta_description text;
alter table article_seo add column if not exists canonical_url text;
alter table article_seo add column if not exists og_title text;
alter table article_seo add column if not exists og_description text;
alter table article_seo add column if not exists og_image text;
alter table article_seo add column if not exists created_at timestamptz default now();

alter table articles add column if not exists seo_title text;
alter table articles add column if not exists seo_description text;
alter table articles add column if not exists canonical_url text;
alter table articles add column if not exists updated_at timestamptz default now();
alter table articles add column if not exists google_news_ready boolean default false;
alter table articles add column if not exists social_status text default 'not_started';

insert into launch_checklist (area, item, status, notes)
select 'Online beta', 'Deploy private Vercel beta URL', 'todo', 'Use staging URL before moving haidagwaiinews.com.'
where not exists (select 1 from launch_checklist where item = 'Deploy private Vercel beta URL');

insert into launch_checklist (area, item, status, notes)
select 'Google News', 'Confirm article schema, RSS, news sitemap and clean article URLs', 'todo', 'Check source code and Search Console after beta deploy.'
where not exists (select 1 from launch_checklist where item = 'Confirm article schema, RSS, news sitemap and clean article URLs');

insert into launch_checklist (area, item, status, notes)
select 'Editorial', 'Editor can create, edit, upload image, publish and feature articles without database access', 'todo', 'Test on editor laptop and phone.'
where not exists (select 1 from launch_checklist where item = 'Editor can create, edit, upload image, publish and feature articles without database access');