-- HGN v49 Launch Polish / safe schema patch
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
  needs_photos boolean default false,
  notes text,
  status text default 'planned',
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

create table if not exists pulse_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid,
  option_value text,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text,
  town text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  contact_name text,
  contact_email text,
  contact_phone text,
  image_url text,
  status text default 'pending',
  featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text,
  notice text,
  category text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  name text,
  dates text,
  notice text,
  details text,
  contact_name text,
  contact_email text,
  contact_phone text,
  photo_url text,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table articles add column if not exists homepage_section text;
alter table articles add column if not exists priority integer default 0;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists status text default 'published';

insert into community_pulse (question, option_one, option_two, option_three, option_four, status)
select 'What should HGN cover more of this week?', 'Community events', 'Local government', 'Sports', 'Marketplace / jobs', 'active'
where not exists (select 1 from community_pulse);

insert into newsroom_assignments (title, description, assigned_to, status)
select 'Plan next print edition', 'Collect story ideas, ads, notices, photos and columnist plans for the next issue.', 'Newsroom', 'open'
where not exists (select 1 from newsroom_assignments where title = 'Plan next print edition');
