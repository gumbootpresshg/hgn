-- HGN v41 stabilization / daily-use polish
-- Safe to run more than once. Creates/patches tables used by submissions, events, classifieds, ads, notices and obituaries.

create extension if not exists pgcrypto;

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  source text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists community_events (
  id uuid primary key default gen_random_uuid(),
  title text,
  date date,
  time text,
  location text,
  town text,
  category text default 'Community',
  description text,
  contact_name text,
  email text,
  phone text,
  newsletter_opt_in boolean default false,
  featured boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table community_events add column if not exists date date;
alter table community_events add column if not exists time text;
alter table community_events add column if not exists location text;
alter table community_events add column if not exists town text;
alter table community_events add column if not exists category text default 'Community';
alter table community_events add column if not exists description text;
alter table community_events add column if not exists contact_name text;
alter table community_events add column if not exists email text;
alter table community_events add column if not exists phone text;
alter table community_events add column if not exists newsletter_opt_in boolean default false;
alter table community_events add column if not exists featured boolean default false;
alter table community_events add column if not exists status text default 'pending';
alter table community_events add column if not exists published_at timestamptz;
alter table community_events add column if not exists created_at timestamptz default now();

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
  featured boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table marketplace_listings add column if not exists town text;
alter table marketplace_listings add column if not exists newsletter_opt_in boolean default false;
alter table marketplace_listings add column if not exists featured boolean default false;
alter table marketplace_listings add column if not exists published_at timestamptz;

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

alter table advertiser_requests add column if not exists newsletter_opt_in boolean default false;
alter table advertiser_requests add column if not exists artwork_url text;
alter table advertiser_requests add column if not exists status text default 'pending';

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text,
  notice_type text,
  details text,
  town text,
  contact_name text,
  contact_email text,
  contact_phone text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table notices add column if not exists notice_type text;
alter table notices add column if not exists details text;
alter table notices add column if not exists town text;
alter table notices add column if not exists contact_name text;
alter table notices add column if not exists contact_email text;
alter table notices add column if not exists contact_phone text;
alter table notices add column if not exists newsletter_opt_in boolean default false;
alter table notices add column if not exists status text default 'pending';
alter table notices add column if not exists published_at timestamptz;

create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  name text,
  dates text,
  details text,
  notice text,
  contact_name text,
  contact_email text,
  contact_phone text,
  photo_url text,
  image_url text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table obituaries add column if not exists name text;
alter table obituaries add column if not exists dates text;
alter table obituaries add column if not exists details text;
alter table obituaries add column if not exists notice text;
alter table obituaries alter column notice drop not null;
alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
alter table obituaries add column if not exists image_url text;
alter table obituaries add column if not exists newsletter_opt_in boolean default false;
alter table obituaries add column if not exists status text default 'pending';
alter table obituaries add column if not exists published_at timestamptz;
alter table obituaries add column if not exists created_at timestamptz default now();

create table if not exists ad_payments (
  id uuid primary key default gen_random_uuid(),
  advertiser_request_id uuid,
  business_name text,
  contact_email text,
  square_payment_link text,
  amount text,
  status text default 'unpaid',
  notes text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- Article organization columns used by the editor/homepage.
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists category text;
alter table articles add column if not exists status text default 'published';
alter table articles add column if not exists published_at timestamptz;

-- Demo/seed content only when tables are empty.
insert into community_events (title, date, time, location, town, category, description, status, published_at, featured)
select 'Community Calendar: submit your event', current_date + interval '2 days', 'All day', 'Haida Gwaii', 'Island-wide', 'Community', 'Community events can be submitted online and approved by HGN editors.', 'published', now(), true
where not exists (select 1 from community_events);

insert into notices (title, notice_type, town, details, status, published_at)
select 'Submit a community notice', 'Community Notice', 'Haida Gwaii', 'Public notices, meeting notices, thank-yous and announcements can be submitted for editor review.', 'published', now()
where not exists (select 1 from notices);

insert into obituaries (name, dates, details, notice, status, published_at)
select 'Obituary submissions', '', 'Families can submit obituary information online or contact the paper for help placing an obituary.', 'Families can submit obituary information online or contact the paper for help placing an obituary.', 'published', now()
where not exists (select 1 from obituaries);

insert into marketplace_listings (title, description, category, town, price, contact_name, status, published_at, featured)
select 'Sample marketplace listing', 'Marketplace listings can be submitted by readers and approved by the editor.', 'Marketplace', 'Haida Gwaii', '', 'Haida Gwaii News', 'published', now(), true
where not exists (select 1 from marketplace_listings);
