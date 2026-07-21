-- HGN v51 Schema Hardening + Beta Polish
-- Safe to rerun. Adds missing columns/tables used by the public beta builds.

create extension if not exists pgcrypto;

-- ARTICLES
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text,
  excerpt text,
  body text,
  author_name text,
  category text,
  image_url text,
  status text default 'draft',
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists homepage_section text;
alter table articles add column if not exists priority integer default 0;
alter table articles add column if not exists subtitle text;
alter table articles add column if not exists updated_at timestamptz default now();
create unique index if not exists articles_slug_unique on articles(slug);

-- EVENTS
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text,
  town text,
  event_date date,
  event_time text,
  location text,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table events add column if not exists organizer_name text;
alter table events add column if not exists organizer_email text;
alter table events add column if not exists organizer_phone text;
alter table events add column if not exists image_url text;
alter table events add column if not exists featured boolean default false;
alter table events add column if not exists newsletter_opt_in boolean default false;

-- NOTICES
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text,
  type text,
  town text,
  message text,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table notices add column if not exists contact_name text;
alter table notices add column if not exists contact_email text;
alter table notices add column if not exists contact_phone text;
alter table notices add column if not exists newsletter_opt_in boolean default false;

-- OBITUARIES
create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  name text,
  notice text,
  dates text,
  details text,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
alter table obituaries alter column notice drop not null;

-- MARKETPLACE / CLASSIFIEDS
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

create table if not exists marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  sort_order integer default 0,
  active boolean default true
);

create table if not exists hgn_towns (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  sort_order integer default 0,
  active boolean default true
);

insert into marketplace_categories (name, sort_order) values
('Marketplace', 1), ('Vehicles & Boats', 2), ('Realty', 3), ('Jobs', 4), ('Notices', 5), ('Services', 6), ('Free', 7)
on conflict (name) do nothing;

insert into hgn_towns (name, sort_order) values
('Daajing Giids', 1), ('Skidegate', 2), ('Tlell', 3), ('Port Clements', 4), ('Masset', 5), ('Old Massett', 6), ('Sandspit', 7), ('Tow Hill', 8), ('All Haida Gwaii', 9)
on conflict (name) do nothing;

-- ADVERTISING / REVENUE
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

create table if not exists ad_placements (
  id uuid primary key default gen_random_uuid(),
  title text,
  placement text,
  size text,
  image_url text,
  click_url text,
  start_date date,
  end_date date,
  priority integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists square_payment_links (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  purpose text,
  amount text,
  square_url text,
  paid boolean default false,
  created_at timestamptz default now()
);

-- NEWSLETTER / AUDIENCE
create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  source text,
  status text default 'subscribed',
  created_at timestamptz default now()
);

-- COMMUNITY PULSE
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

insert into community_pulse (question, option_one, option_two, option_three, option_four, status)
select 'What should HGN cover more of this week?', 'Community events', 'Local government', 'Sports', 'Jobs and classifieds', 'active'
where not exists (select 1 from community_pulse);

-- STAFF / NEWSROOM
create table if not exists staff_messages (
  id uuid primary key default gen_random_uuid(),
  author_name text,
  message text,
  created_at timestamptz default now()
);

create table if not exists newsroom_assignments (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  assigned_to text,
  due_date date,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists contributor_plans (
  id uuid primary key default gen_random_uuid(),
  contributor_name text,
  contributor_email text,
  planned_submission text,
  size text,
  notes text,
  status text default 'planned',
  created_at timestamptz default now()
);

-- LIVE MAP
create table if not exists live_map_items (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text,
  area text,
  details text,
  lat double precision,
  lng double precision,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table live_map_items add column if not exists town text;
alter table live_map_items add column if not exists contact_name text;
alter table live_map_items add column if not exists contact_email text;

-- BASIC SAMPLE DATA: only inserts if empty
insert into events (title, description, category, town, event_date, event_time, location, status, published_at)
select 'Community calendar submissions open', 'Send HGN your community events for the online calendar and print paper.', 'Community', 'All Haida Gwaii', current_date + 3, 'All day', 'Haida Gwaii', 'published', now()
where not exists (select 1 from events);

insert into notices (title, type, town, message, status, published_at)
select 'Submit a community notice', 'Community Notice', 'All Haida Gwaii', 'Readers can submit community notices for editor review.', 'published', now()
where not exists (select 1 from notices);

insert into obituaries (name, dates, details, notice, status, published_at)
select 'Obituary submissions', 'Contact HGN', 'Families can submit obituary information online or contact the paper.', 'Families can submit obituary information online or contact the paper.', 'published', now()
where not exists (select 1 from obituaries);

insert into ad_placements (title, placement, size, click_url, active)
select 'Advertise with Haida Gwaii News', 'homepage-cta', 'banner', '/advertise', true
where not exists (select 1 from ad_placements);
