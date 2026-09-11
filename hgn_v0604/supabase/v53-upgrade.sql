-- HGN v53 Reader Experience
-- Safe to rerun. Harden older Supabase schemas before public beta testing.

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
alter table articles add column if not exists subtitle text;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists homepage_section text;
alter table articles add column if not exists priority integer default 0;
alter table articles add column if not exists updated_at timestamptz default now();
create unique index if not exists articles_slug_unique on articles(slug);

-- EVENTS
create table if not exists events (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
alter table events add column if not exists title text;
alter table events add column if not exists description text;
alter table events add column if not exists category text;
alter table events add column if not exists town text;
alter table events add column if not exists event_date date;
alter table events add column if not exists event_time text;
alter table events add column if not exists location text;
alter table events add column if not exists status text default 'pending';
alter table events add column if not exists published_at timestamptz;
alter table events add column if not exists organizer_name text;
alter table events add column if not exists organizer_email text;
alter table events add column if not exists organizer_phone text;
alter table events add column if not exists image_url text;
alter table events add column if not exists featured boolean default false;
alter table events add column if not exists newsletter_opt_in boolean default false;

-- NOTICES
create table if not exists notices (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
alter table notices add column if not exists title text;
alter table notices add column if not exists type text;
alter table notices add column if not exists town text;
alter table notices add column if not exists message text;
alter table notices add column if not exists status text default 'pending';
alter table notices add column if not exists published_at timestamptz;
alter table notices add column if not exists contact_name text;
alter table notices add column if not exists contact_email text;
alter table notices add column if not exists contact_phone text;
alter table notices add column if not exists newsletter_opt_in boolean default false;

-- OBITUARIES
create table if not exists obituaries (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
alter table obituaries add column if not exists name text;
alter table obituaries add column if not exists notice text;
alter table obituaries add column if not exists dates text;
alter table obituaries add column if not exists details text;
alter table obituaries add column if not exists status text default 'pending';
alter table obituaries add column if not exists published_at timestamptz;
alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
alter table obituaries alter column notice drop not null;

-- MARKETPLACE / CLASSIFIEDS
create table if not exists marketplace_listings (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
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
alter table marketplace_listings add column if not exists published_at timestamptz;

create table if not exists marketplace_categories (id uuid primary key default gen_random_uuid(), name text unique, sort_order integer default 0, active boolean default true);
create table if not exists hgn_towns (id uuid primary key default gen_random_uuid(), name text unique, sort_order integer default 0, active boolean default true);
insert into marketplace_categories (name, sort_order) values
('Marketplace',1),('Vehicles & Boats',2),('Realty',3),('Jobs',4),('Notices',5),('Services',6),('Free',7)
on conflict (name) do nothing;
insert into hgn_towns (name, sort_order) values
('Daajing Giids',1),('Skidegate',2),('Tlell',3),('Port Clements',4),('Masset',5),('Old Massett',6),('Sandspit',7),('Tow Hill',8),('All Haida Gwaii',9)
on conflict (name) do nothing;

-- ADVERTISING / REVENUE
create table if not exists advertiser_requests (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
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

create table if not exists ad_placements (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
alter table ad_placements add column if not exists title text;
alter table ad_placements add column if not exists placement text;
alter table ad_placements add column if not exists size text;
alter table ad_placements add column if not exists image_url text;
alter table ad_placements add column if not exists click_url text;
alter table ad_placements add column if not exists start_date date;
alter table ad_placements add column if not exists end_date date;
alter table ad_placements add column if not exists starts_at timestamptz;
alter table ad_placements add column if not exists ends_at timestamptz;
alter table ad_placements add column if not exists priority integer default 0;
alter table ad_placements add column if not exists active boolean default true;

create table if not exists square_payment_links (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
alter table square_payment_links add column if not exists customer_name text;
alter table square_payment_links add column if not exists customer_email text;
alter table square_payment_links add column if not exists purpose text;
alter table square_payment_links add column if not exists amount text;
alter table square_payment_links add column if not exists square_url text;
alter table square_payment_links add column if not exists paid boolean default false;

-- NEWSLETTER / AUDIENCE
create table if not exists newsletter_signups (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
alter table newsletter_signups add column if not exists email text;
alter table newsletter_signups add column if not exists name text;
alter table newsletter_signups add column if not exists source text;
alter table newsletter_signups add column if not exists status text default 'subscribed';
create unique index if not exists newsletter_signups_email_unique on newsletter_signups(email);

-- COMMUNITY PULSE
create table if not exists community_pulse (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
alter table community_pulse add column if not exists question text;
alter table community_pulse add column if not exists option_one text;
alter table community_pulse add column if not exists option_two text;
alter table community_pulse add column if not exists option_three text;
alter table community_pulse add column if not exists option_four text;
alter table community_pulse add column if not exists status text default 'active';
create table if not exists pulse_votes (id uuid primary key default gen_random_uuid(), poll_id uuid, option_value text, created_at timestamptz default now());

-- STAFF / NEWSROOM
create table if not exists staff_messages (id uuid primary key default gen_random_uuid(), author_name text, message text, created_at timestamptz default now());
create table if not exists newsroom_assignments (id uuid primary key default gen_random_uuid(), title text, description text, assigned_to text, due_date date, status text default 'open', created_at timestamptz default now());
create table if not exists contributor_plans (id uuid primary key default gen_random_uuid(), contributor_name text, contributor_email text, planned_submission text, size text, notes text, status text default 'planned', created_at timestamptz default now());

-- LIVE MAP
create table if not exists live_map_items (id uuid primary key default gen_random_uuid(), created_at timestamptz default now());
alter table live_map_items add column if not exists type text;
alter table live_map_items add column if not exists title text;
alter table live_map_items add column if not exists area text;
alter table live_map_items add column if not exists details text;
alter table live_map_items add column if not exists lat double precision;
alter table live_map_items add column if not exists lng double precision;
alter table live_map_items add column if not exists status text default 'pending';
alter table live_map_items add column if not exists published_at timestamptz;
alter table live_map_items add column if not exists town text;
alter table live_map_items add column if not exists contact_name text;
alter table live_map_items add column if not exists contact_email text;

-- PUBLIC BETA CHECKLIST
create table if not exists launch_checklist (
  id uuid primary key default gen_random_uuid(),
  area text,
  item text,
  status text default 'todo',
  notes text,
  created_at timestamptz default now()
);

insert into launch_checklist (area, item, status, notes)
select 'Demo', 'Click every top menu item and confirm no 404s', 'todo', 'Before sending beta link to owner/editor.'
where not exists (select 1 from launch_checklist where item = 'Click every top menu item and confirm no 404s');
insert into launch_checklist (area, item, status, notes)
select 'Admin', 'Test edit article, upload image, publish, archive', 'todo', 'Must be easy for non-technical editor.'
where not exists (select 1 from launch_checklist where item = 'Test edit article, upload image, publish, archive');
insert into launch_checklist (area, item, status, notes)
select 'Mobile', 'Test homepage, article, menu, marketplace, events on phone', 'todo', 'Most readers arrive from mobile/social.'
where not exists (select 1 from launch_checklist where item = 'Test homepage, article, menu, marketplace, events on phone');

-- SAMPLE DATA: only when empty, after all columns exist.
insert into community_pulse (question, option_one, option_two, option_three, option_four, status)
select 'What should HGN cover more of this week?', 'Community events', 'Local government', 'Sports', 'Jobs and classifieds', 'active'
where not exists (select 1 from community_pulse);

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
