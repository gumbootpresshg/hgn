-- HGN v61 Beta Ready Upgrade
-- Safe schema hardening. All changes use IF NOT EXISTS where possible.

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

create table if not exists seo_checks (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  title text,
  status text default 'todo',
  notes text,
  created_at timestamptz default now()
);

alter table articles add column if not exists seo_title text;
alter table articles add column if not exists seo_description text;
alter table articles add column if not exists canonical_url text;
alter table articles add column if not exists og_image_url text;
alter table articles add column if not exists updated_at timestamptz;
alter table articles add column if not exists google_news_ready boolean default false;

create table if not exists launch_checklist (
  id uuid primary key default gen_random_uuid(),
  title text,
  area text,
  item text,
  status text default 'todo',
  notes text,
  created_at timestamptz default now()
);

alter table launch_checklist add column if not exists title text;
alter table launch_checklist add column if not exists area text;
alter table launch_checklist add column if not exists item text;
alter table launch_checklist add column if not exists status text default 'todo';
alter table launch_checklist add column if not exists notes text;
alter table launch_checklist add column if not exists created_at timestamptz default now();

insert into launch_checklist (title, area, item, status, notes)
select 'Google News readiness', 'SEO', 'Confirm sitemap, RSS, article schema, authors, dates and images', 'todo', 'Check before public launch.'
where not exists (select 1 from launch_checklist where title = 'Google News readiness');

insert into launch_checklist (title, area, item, status, notes)
select 'Social workflow', 'Newsroom', 'Create Facebook/X/LinkedIn copy for each major story', 'todo', 'Phase 1 is copy-and-paste social assistant.'
where not exists (select 1 from launch_checklist where title = 'Social workflow');
