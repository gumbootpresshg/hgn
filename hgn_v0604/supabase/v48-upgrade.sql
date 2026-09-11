-- HGN v48 Launch Ready Polish
-- Safe/idempotent SQL. Can be run multiple times.

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

create table if not exists newsroom_assignments (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  assigned_to text,
  due_date date,
  priority text default 'normal',
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists contributor_plans (
  id uuid primary key default gen_random_uuid(),
  contributor_name text,
  contributor_email text,
  planned_submission text,
  submission_type text,
  size text,
  notes text,
  status text default 'planned',
  created_at timestamptz default now()
);

create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  source text,
  interests text,
  created_at timestamptz default now()
);

create table if not exists site_notices (
  id uuid primary key default gen_random_uuid(),
  title text,
  notice_type text,
  details text,
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
  notice text,
  dates text,
  details text,
  contact_name text,
  contact_email text,
  contact_phone text,
  photo_url text,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table obituaries add column if not exists name text;
alter table obituaries add column if not exists notice text;
alter table obituaries alter column notice drop not null;
alter table obituaries add column if not exists dates text;
alter table obituaries add column if not exists details text;
alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
alter table obituaries add column if not exists status text default 'pending';
alter table obituaries add column if not exists published_at timestamptz;
alter table obituaries add column if not exists created_at timestamptz default now();

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

alter table articles add column if not exists homepage_section text;
alter table articles add column if not exists priority integer default 0;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists status text default 'draft';

insert into community_pulse (question, option_one, option_two, option_three, option_four, status)
select 'What should HGN cover more of this week?', 'Community events', 'Local government', 'Sports', 'Marketplace / jobs', 'active'
where not exists (select 1 from community_pulse);

insert into newsroom_assignments (title, description, assigned_to, due_date, priority, status)
select 'Plan next print edition front page', 'Choose main story, photo, and secondary stories for the upcoming paper.', 'Editor', current_date + interval '3 days', 'high', 'open'
where not exists (select 1 from newsroom_assignments where title = 'Plan next print edition front page');
