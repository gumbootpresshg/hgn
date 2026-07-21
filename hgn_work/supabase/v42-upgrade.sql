-- HGN v42 Daily Desk + audience/submission stabilization
-- Safe to run more than once. Designed to patch older partial schemas.

create extension if not exists pgcrypto;

-- Core audience/newsletter table
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  town text,
  source text,
  interests text[] default '{}',
  status text default 'active',
  created_at timestamptz default now()
);
alter table subscribers add column if not exists town text;
alter table subscribers add column if not exists source text;
alter table subscribers add column if not exists interests text[] default '{}';
alter table subscribers add column if not exists status text default 'active';
alter table subscribers add column if not exists created_at timestamptz default now();

-- Compatibility with older newsletter pages/admin tabs
create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  town text,
  source text,
  created_at timestamptz default now()
);
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  town text,
  source text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Events
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
alter table community_events add column if not exists category text default 'Community';
alter table community_events add column if not exists newsletter_opt_in boolean default false;
alter table community_events add column if not exists featured boolean default false;
alter table community_events add column if not exists published_at timestamptz;
alter table community_events add column if not exists created_at timestamptz default now();

-- Marketplace / Classifieds
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
alter table marketplace_listings add column if not exists newsletter_opt_in boolean default false;
alter table marketplace_listings add column if not exists featured boolean default false;
alter table marketplace_listings add column if not exists published_at timestamptz;

create table if not exists classifieds (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text,
  town text,
  phone text,
  email text,
  contact_name text,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

-- Advertiser requests + payment/accounting tracking
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

-- Notices and obituaries
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
alter table notices add column if not exists newsletter_opt_in boolean default false;
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
alter table obituaries add column if not exists published_at timestamptz;

-- Letters
create table if not exists letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  town text,
  letter text,
  newsletter_opt_in boolean default false,
  status text default 'new',
  created_at timestamptz default now(),
  published_at timestamptz
);
alter table letters_to_editor add column if not exists newsletter_opt_in boolean default false;
alter table letters_to_editor add column if not exists published_at timestamptz;

-- Staff / newsroom daily desk
create table if not exists staff_messages (
  id uuid primary key default gen_random_uuid(),
  author_name text,
  message text,
  lane text default 'General',
  created_at timestamptz default now()
);
create table if not exists contributor_plans (
  id uuid primary key default gen_random_uuid(),
  contributor_name text,
  email text,
  edition_date date,
  contribution_type text,
  title text,
  notes text,
  status text default 'planned',
  created_at timestamptz default now()
);
create table if not exists story_assignments (
  id uuid primary key default gen_random_uuid(),
  title text,
  assigned_to text,
  deadline date,
  notes text,
  status text default 'idea',
  created_at timestamptz default now()
);

-- Articles organization
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists category text;
alter table articles add column if not exists status text default 'published';
alter table articles add column if not exists published_at timestamptz;
alter table articles add column if not exists updated_at timestamptz default now();
create unique index if not exists articles_slug_unique on articles(slug);

-- Useful starter data only if empty
insert into community_events (title, date, time, location, town, category, description, status, published_at, featured)
select 'Submit your community event', current_date + interval '2 days', 'All day', 'Haida Gwaii', 'Island-wide', 'Community', 'Events submitted by readers can be approved by the editor and promoted on the front page.', 'published', now(), true
where not exists (select 1 from community_events);

insert into notices (title, notice_type, town, details, status, published_at)
select 'Submit a community notice', 'Community Notice', 'Haida Gwaii', 'Meeting notices, thank-yous, announcements and public notices can be submitted for editor review.', 'published', now()
where not exists (select 1 from notices);

insert into obituaries (name, dates, details, notice, status, published_at)
select 'Obituary submissions', '', 'Families can submit obituary information online or contact Haida Gwaii News for help placing an obituary.', 'Families can submit obituary information online or contact Haida Gwaii News for help placing an obituary.', 'published', now()
where not exists (select 1 from obituaries);
