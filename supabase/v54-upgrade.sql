-- HGN v54 Beta Launch Readiness / safer schema patch

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

create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text,
  name text,
  source text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists submission_inbox (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text,
  name text,
  email text,
  phone text,
  town text,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  newsletter_opt_in boolean default false,
  created_at timestamptz default now()
);

-- Harden commonly-used tables that have evolved over many builds.
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

insert into launch_checklist (title, area, item, status, notes)
select 'Beta menu test', 'Demo', 'Click every top menu item and confirm no 404s', 'todo', 'Before sending beta link to owner/editor.'
where not exists (select 1 from launch_checklist where item = 'Click every top menu item and confirm no 404s');

insert into launch_checklist (title, area, item, status, notes)
select 'Mobile homepage test', 'Mobile', 'Open homepage on phone and check menu, ads, images, and article flow', 'todo', 'Use local network URL or Vercel preview.'
where not exists (select 1 from launch_checklist where item = 'Open homepage on phone and check menu, ads, images, and article flow');

insert into launch_checklist (title, area, item, status, notes)
select 'Editor workflow test', 'Newsroom', 'Create, edit, image-upload, feature, publish, and unpublish one article', 'todo', 'This is the key owner/editor demo path.'
where not exists (select 1 from launch_checklist where item = 'Create, edit, image-upload, feature, publish, and unpublish one article');
