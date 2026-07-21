-- HGN v64 Island Network Verified
-- Safe/idempotent schema hardening for beta testing and community-platform features.

create extension if not exists pgcrypto;

-- Articles: Google News / social / homepage control
alter table if exists articles add column if not exists seo_title text;
alter table if exists articles add column if not exists seo_description text;
alter table if exists articles add column if not exists canonical_url text;
alter table if exists articles add column if not exists og_image_url text;
alter table if exists articles add column if not exists social_summary text;
alter table if exists articles add column if not exists homepage_section text;
alter table if exists articles add column if not exists priority integer default 0;
alter table if exists articles add column if not exists updated_at timestamptz default now();
alter table if exists articles add column if not exists image_caption text;
alter table if exists articles add column if not exists image_credit text;
alter table if exists articles add column if not exists image_alt text;

-- Media library
create table if not exists media_library (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  title text,
  original_filename text,
  image_url text,
  thumbnail_url text,
  storage_path text,
  caption text,
  credit text,
  alt_text text,
  width integer,
  height integer,
  file_size integer,
  status text default 'active',
  created_at timestamptz default now()
);
alter table media_library add column if not exists article_id uuid;
alter table media_library add column if not exists title text;
alter table media_library add column if not exists original_filename text;
alter table media_library add column if not exists image_url text;
alter table media_library add column if not exists thumbnail_url text;
alter table media_library add column if not exists storage_path text;
alter table media_library add column if not exists caption text;
alter table media_library add column if not exists credit text;
alter table media_library add column if not exists alt_text text;
alter table media_library add column if not exists width integer;
alter table media_library add column if not exists height integer;
alter table media_library add column if not exists file_size integer;
alter table media_library add column if not exists status text default 'active';
alter table media_library add column if not exists created_at timestamptz default now();

create table if not exists article_images (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  image_url text,
  thumbnail_url text,
  caption text,
  credit text,
  alt_text text,
  width integer,
  height integer,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table article_images add column if not exists article_id uuid;
alter table article_images add column if not exists image_url text;
alter table article_images add column if not exists thumbnail_url text;
alter table article_images add column if not exists caption text;
alter table article_images add column if not exists credit text;
alter table article_images add column if not exists alt_text text;
alter table article_images add column if not exists width integer;
alter table article_images add column if not exists height integer;
alter table article_images add column if not exists sort_order integer default 0;
alter table article_images add column if not exists created_at timestamptz default now();

-- Social post assistant
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

-- Events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text,
  town text,
  location text,
  event_date date,
  event_time text,
  contact_name text,
  contact_email text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);
alter table events add column if not exists description text;
alter table events add column if not exists category text;
alter table events add column if not exists town text;
alter table events add column if not exists location text;
alter table events add column if not exists event_date date;
alter table events add column if not exists event_time text;
alter table events add column if not exists contact_name text;
alter table events add column if not exists contact_email text;
alter table events add column if not exists newsletter_opt_in boolean default false;
alter table events add column if not exists status text default 'pending';
alter table events add column if not exists published_at timestamptz;
alter table events add column if not exists created_at timestamptz default now();

-- Notices
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text,
  type text,
  town text,
  message text,
  contact_name text,
  contact_email text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);
alter table notices add column if not exists type text;
alter table notices add column if not exists town text;
alter table notices add column if not exists message text;
alter table notices add column if not exists contact_name text;
alter table notices add column if not exists contact_email text;
alter table notices add column if not exists newsletter_opt_in boolean default false;
alter table notices add column if not exists status text default 'pending';
alter table notices add column if not exists published_at timestamptz;
alter table notices add column if not exists created_at timestamptz default now();

-- Obituaries
create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  name text,
  title text,
  notice text,
  dates text,
  details text,
  contact_name text,
  contact_email text,
  contact_phone text,
  photo_url text,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);
alter table obituaries add column if not exists name text;
alter table obituaries add column if not exists title text;
alter table obituaries add column if not exists notice text;
alter table obituaries add column if not exists dates text;
alter table obituaries add column if not exists details text;
alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
alter table obituaries add column if not exists status text default 'pending';
alter table obituaries add column if not exists published_at timestamptz;
alter table obituaries add column if not exists created_at timestamptz default now();

-- Marketplace + advertisers + newsletter
create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text,
  town text,
  price text,
  contact_name text,
  contact_email text,
  contact_phone text,
  image_url text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

create table if not exists advertiser_requests (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  ad_type text,
  placement text,
  budget text,
  run_dates text,
  message text,
  artwork_url text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  source text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists beta_feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  area text,
  feedback text,
  priority text default 'normal',
  status text default 'open',
  created_at timestamptz default now()
);

-- Launch checklist safe shape
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

insert into launch_checklist (title, area, item, status, notes)
select 'Beta smoke test', 'Launch', 'Click every public menu item and confirm no 404s', 'todo', 'Run before sharing private beta link.'
where not exists (select 1 from launch_checklist where item = 'Click every public menu item and confirm no 404s');

insert into launch_checklist (title, area, item, status, notes)
select 'Mobile test', 'Mobile', 'Test homepage, article page, marketplace and admin on a phone', 'todo', 'Most HGN readers will arrive from mobile/social.'
where not exists (select 1 from launch_checklist where item = 'Test homepage, article page, marketplace and admin on a phone');
