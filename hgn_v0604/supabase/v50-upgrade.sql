-- HGN v50 Public Beta Polish / safe schema patch
create extension if not exists pgcrypto;

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  interests text,
  source text,
  status text default 'active',
  created_at timestamptz default now()
);

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
  featured boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text,
  name text,
  type text,
  town text,
  message text,
  details text,
  notice text,
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
  title text,
  dates text,
  details text,
  notice text,
  message text,
  contact_name text,
  contact_email text,
  contact_phone text,
  photo_url text,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table obituaries add column if not exists name text;
alter table obituaries add column if not exists title text;
alter table obituaries add column if not exists dates text;
alter table obituaries add column if not exists details text;
alter table obituaries add column if not exists notice text;
alter table obituaries add column if not exists message text;
alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
alter table obituaries add column if not exists status text default 'pending';
alter table obituaries add column if not exists published_at timestamptz;
alter table obituaries add column if not exists created_at timestamptz default now();
alter table obituaries alter column notice drop not null;

create table if not exists public_submissions (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text,
  name text,
  email text,
  phone text,
  town text,
  message text,
  image_url text,
  newsletter_opt_in boolean default false,
  status text default 'pending',
  created_at timestamptz default now()
);

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

insert into community_pulse (question, option_one, option_two, option_three, option_four, status)
select 'What should HGN cover more this week?', 'Events', 'Local government', 'Sports', 'Marketplace/jobs', 'active'
where not exists (select 1 from community_pulse);

insert into events (title, description, category, town, event_date, status, published_at)
select 'Community calendar submissions open', 'Send events to HGN for approval and publication on the community calendar.', 'Community', 'Haida Gwaii', current_date, 'published', now()
where not exists (select 1 from events);

insert into notices (title, type, town, message, status, published_at)
select 'Submit community notices', 'Community', 'Haida Gwaii', 'Send notices, announcements and community updates to Haida Gwaii News for editor review.', 'published', now()
where not exists (select 1 from notices);

insert into obituaries (name, dates, details, notice, status, published_at)
select 'Obituary submissions', 'Contact HGN', 'Families can submit obituary information, photos and service details to Haida Gwaii News.', 'Families can submit obituary information, photos and service details to Haida Gwaii News.', 'published', now()
where not exists (select 1 from obituaries);
