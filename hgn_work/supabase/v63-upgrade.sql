-- HGN v63 Community Platform - safe/idempotent migration
-- Run in Supabase SQL Editor.

create table if not exists community_pulse (
  id uuid primary key default gen_random_uuid(),
  question text,
  option_one text,
  option_two text,
  option_three text,
  option_four text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists pulse_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid,
  option_value text,
  created_at timestamptz default now()
);

create table if not exists daily_highlights (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  link_url text,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

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

create table if not exists newsroom_assignments (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  assigned_to text,
  due_date date,
  status text default 'open',
  created_at timestamptz default now()
);

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

alter table articles add column if not exists seo_title text;
alter table articles add column if not exists seo_description text;
alter table articles add column if not exists canonical_url text;
alter table articles add column if not exists social_title text;
alter table articles add column if not exists social_description text;
alter table articles add column if not exists social_image_url text;
alter table articles add column if not exists homepage_section text;
alter table articles add column if not exists priority integer default 0;
alter table articles add column if not exists updated_at timestamptz;

alter table events add column if not exists featured boolean default false;
alter table events add column if not exists homepage_featured boolean default false;
alter table events add column if not exists event_date date;
alter table events add column if not exists event_time text;
alter table events add column if not exists town text;
alter table events add column if not exists category text;
alter table events add column if not exists status text default 'pending';

alter table marketplace_listings add column if not exists featured boolean default false;
alter table marketplace_listings add column if not exists newsletter_opt_in boolean default false;

insert into community_pulse (question, option_one, option_two, option_three, option_four, status)
select
  'What should HGN cover more of this week?',
  'Community events',
  'Local government',
  'Sports',
  'Marketplace / jobs',
  'active'
where not exists (select 1 from community_pulse);

insert into daily_highlights (title, description, link_url, sort_order, active)
select 'Submit an event', 'Add your community event for editor approval.', '/submit-event', 10, true
where not exists (select 1 from daily_highlights where link_url = '/submit-event');

insert into daily_highlights (title, description, link_url, sort_order, active)
select 'Support local news', 'Help keep Haida Gwaii News free for everyone.', '/support', 20, true
where not exists (select 1 from daily_highlights where link_url = '/support');

insert into launch_checklist (title, area, item, status, notes)
select 'Check top menu', 'Public site', 'Click every top menu item and confirm no 404s', 'todo', 'Before sending beta link to owner/editor.'
where not exists (select 1 from launch_checklist where item = 'Click every top menu item and confirm no 404s');
