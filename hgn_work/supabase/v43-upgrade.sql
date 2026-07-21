
-- HGN v43 launch polish / missing-table safety patch
create extension if not exists pgcrypto;

create table if not exists audience_members (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  source text,
  newsletter_opt_in boolean default true,
  breaking_news_opt_in boolean default false,
  events_opt_in boolean default false,
  classifieds_opt_in boolean default false,
  supporter_opt_in boolean default false,
  created_at timestamptz default now()
);

create table if not exists community_events (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text,
  town text,
  location text,
  date date,
  start_time text,
  end_time text,
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
  square_payment_link text,
  message text,
  artwork_url text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text,
  notice text,
  details text,
  category text,
  town text,
  contact_name text,
  contact_email text,
  contact_phone text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  name text,
  notice text,
  dates text,
  details text,
  contact_name text,
  contact_email text,
  contact_phone text,
  photo_url text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table obituaries alter column notice drop not null;
alter table obituaries add column if not exists dates text;
alter table obituaries add column if not exists details text;
alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
alter table obituaries add column if not exists newsletter_opt_in boolean default false;
alter table obituaries add column if not exists status text default 'pending';
alter table obituaries add column if not exists published_at timestamptz;
alter table obituaries add column if not exists created_at timestamptz default now();

create table if not exists staff_messages (
  id uuid primary key default gen_random_uuid(),
  author_name text,
  message text,
  lane text default 'general',
  created_at timestamptz default now()
);

create table if not exists edition_plans (
  id uuid primary key default gen_random_uuid(),
  title text,
  edition_date date,
  notes text,
  status text default 'planning',
  created_at timestamptz default now()
);

create table if not exists contributor_plans (
  id uuid primary key default gen_random_uuid(),
  contributor_name text,
  contributor_email text,
  edition_date date,
  planned_submission text,
  size_estimate text,
  needs_photos boolean default false,
  notes text,
  status text default 'planned',
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
  priority int default 0,
  status text default 'active',
  created_at timestamptz default now()
);

-- helpful indexes
create index if not exists community_events_status_date_idx on community_events(status, date);
create index if not exists marketplace_status_created_idx on marketplace_listings(status, created_at desc);
create index if not exists notices_status_created_idx on notices(status, created_at desc);
create index if not exists obituaries_status_created_idx on obituaries(status, created_at desc);
create index if not exists ad_placements_status_placement_idx on ad_placements(status, placement);

-- demo-ready seed rows, safe if rerun
insert into community_events (title, description, category, town, location, date, status, published_at, featured)
select 'Community event submissions open', 'Submit community events for editor review and calendar placement.', 'Community', 'Haida Gwaii', 'Island-wide', current_date + interval '3 day', 'published', now(), true
where not exists (select 1 from community_events where title='Community event submissions open');

insert into notices (title, notice, details, category, town, status, published_at)
select 'Submit a community notice', 'Community notices can be sent to Haida Gwaii News for review.', 'Use the notice submission page for announcements, public notices and community updates.', 'Community Notice', 'Haida Gwaii', 'published', now()
where not exists (select 1 from notices where title='Submit a community notice');

insert into obituaries (name, notice, dates, details, status, published_at)
select 'Obituary submissions', 'Families can submit obituary information online or contact the paper.', 'Contact Haida Gwaii News', 'Obituaries can include service information, photos and family messages.', 'published', now()
where not exists (select 1 from obituaries where name='Obituary submissions');
