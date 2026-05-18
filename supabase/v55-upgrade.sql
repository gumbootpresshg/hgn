-- HGN v55 Private Beta Plus / safe schema hardening
-- Designed to run safely even when older tables/columns exist from previous builds.

create table if not exists launch_checklist (
  id uuid primary key default gen_random_uuid(),
  title text,
  area text,
  item text,
  status text default 'todo',
  notes text,
  owner text,
  priority integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table launch_checklist add column if not exists title text;
alter table launch_checklist add column if not exists area text;
alter table launch_checklist add column if not exists item text;
alter table launch_checklist add column if not exists status text default 'todo';
alter table launch_checklist add column if not exists notes text;
alter table launch_checklist add column if not exists owner text;
alter table launch_checklist add column if not exists priority integer default 0;
alter table launch_checklist add column if not exists created_at timestamptz default now();
alter table launch_checklist add column if not exists updated_at timestamptz default now();
alter table launch_checklist alter column title drop not null;

create table if not exists beta_feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  area text,
  message text,
  severity text default 'note',
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text,
  name text,
  source text,
  status text default 'active',
  created_at timestamptz default now()
);
alter table newsletter_signups add column if not exists email text;
alter table newsletter_signups add column if not exists name text;
alter table newsletter_signups add column if not exists source text;
alter table newsletter_signups add column if not exists status text default 'active';
alter table newsletter_signups add column if not exists created_at timestamptz default now();

create table if not exists events (id uuid primary key default gen_random_uuid());
alter table events add column if not exists title text;
alter table events add column if not exists description text;
alter table events add column if not exists category text;
alter table events add column if not exists town text;
alter table events add column if not exists location text;
alter table events add column if not exists event_date date;
alter table events add column if not exists event_time text;
alter table events add column if not exists status text default 'pending';
alter table events add column if not exists published_at timestamptz;
alter table events add column if not exists created_at timestamptz default now();

create table if not exists notices (id uuid primary key default gen_random_uuid());
alter table notices add column if not exists title text;
alter table notices add column if not exists type text;
alter table notices add column if not exists town text;
alter table notices add column if not exists message text;
alter table notices add column if not exists status text default 'pending';
alter table notices add column if not exists contact_name text;
alter table notices add column if not exists contact_email text;
alter table notices add column if not exists published_at timestamptz;
alter table notices add column if not exists created_at timestamptz default now();

create table if not exists obituaries (id uuid primary key default gen_random_uuid());
alter table obituaries add column if not exists name text;
alter table obituaries add column if not exists dates text;
alter table obituaries add column if not exists details text;
alter table obituaries add column if not exists notice text;
alter table obituaries add column if not exists status text default 'pending';
alter table obituaries add column if not exists published_at timestamptz;
alter table obituaries add column if not exists created_at timestamptz default now();
alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
alter table obituaries alter column notice drop not null;

create table if not exists marketplace_listings (id uuid primary key default gen_random_uuid());
alter table marketplace_listings add column if not exists title text;
alter table marketplace_listings add column if not exists description text;
alter table marketplace_listings add column if not exists category text;
alter table marketplace_listings add column if not exists town text;
alter table marketplace_listings add column if not exists price text;
alter table marketplace_listings add column if not exists contact_name text;
alter table marketplace_listings add column if not exists contact_email text;
alter table marketplace_listings add column if not exists contact_phone text;
alter table marketplace_listings add column if not exists image_url text;
alter table marketplace_listings add column if not exists newsletter_opt_in boolean default false;
alter table marketplace_listings add column if not exists status text default 'pending';
alter table marketplace_listings add column if not exists created_at timestamptz default now();
alter table marketplace_listings add column if not exists published_at timestamptz;

create table if not exists advertiser_requests (id uuid primary key default gen_random_uuid());
alter table advertiser_requests add column if not exists business_name text;
alter table advertiser_requests add column if not exists contact_name text;
alter table advertiser_requests add column if not exists contact_email text;
alter table advertiser_requests add column if not exists contact_phone text;
alter table advertiser_requests add column if not exists ad_type text;
alter table advertiser_requests add column if not exists placement text;
alter table advertiser_requests add column if not exists budget text;
alter table advertiser_requests add column if not exists run_dates text;
alter table advertiser_requests add column if not exists message text;
alter table advertiser_requests add column if not exists artwork_url text;
alter table advertiser_requests add column if not exists newsletter_opt_in boolean default false;
alter table advertiser_requests add column if not exists status text default 'pending';
alter table advertiser_requests add column if not exists created_at timestamptz default now();

create table if not exists ad_placements (id uuid primary key default gen_random_uuid());
alter table ad_placements add column if not exists title text;
alter table ad_placements add column if not exists placement text;
alter table ad_placements add column if not exists size text;
alter table ad_placements add column if not exists click_url text;
alter table ad_placements add column if not exists image_url text;
alter table ad_placements add column if not exists active boolean default true;
alter table ad_placements add column if not exists starts_at timestamptz;
alter table ad_placements add column if not exists ends_at timestamptz;
alter table ad_placements add column if not exists priority integer default 0;
alter table ad_placements add column if not exists created_at timestamptz default now();

alter table articles add column if not exists homepage_section text;
alter table articles add column if not exists priority integer default 0;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists featured boolean default false;

insert into launch_checklist (title, area, item, status, notes, priority)
select 'Menu and route test', 'Public site', 'Click every top menu item and confirm there are no 404 pages', 'todo', 'Do this before sharing beta with owner/editor.', 10
where not exists (select 1 from launch_checklist where item = 'Click every top menu item and confirm there are no 404 pages');

insert into launch_checklist (title, area, item, status, notes, priority)
select 'Mobile homepage test', 'Mobile', 'Open the site on phone and check menu, articles, ads, forms and images', 'todo', 'Use your Network URL or Vercel preview link.', 9
where not exists (select 1 from launch_checklist where item = 'Open the site on phone and check menu, articles, ads, forms and images');

insert into launch_checklist (title, area, item, status, notes, priority)
select 'Editor workflow test', 'Newsroom', 'Create, edit, add image, feature, publish and unpublish one article', 'todo', 'This is the most important editor demo path.', 10
where not exists (select 1 from launch_checklist where item = 'Create, edit, add image, feature, publish and unpublish one article');

insert into launch_checklist (title, area, item, status, notes, priority)
select 'Submissions test', 'Community', 'Submit one event, one notice, one obituary and one marketplace listing', 'todo', 'Confirm each lands in admin/submission review.', 8
where not exists (select 1 from launch_checklist where item = 'Submit one event, one notice, one obituary and one marketplace listing');
