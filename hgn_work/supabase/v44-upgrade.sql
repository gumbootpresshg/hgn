-- HGN v44 beta launch operations

create table if not exists beta_feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  page_url text,
  issue_type text,
  message text not null,
  status text default 'new',
  created_at timestamptz default now()
);

alter table beta_feedback enable row level security;

drop policy if exists "Anyone can submit beta feedback" on beta_feedback;
create policy "Anyone can submit beta feedback"
on beta_feedback for insert
with check (true);

drop policy if exists "Anyone can read beta feedback" on beta_feedback;
create policy "Anyone can read beta feedback"
on beta_feedback for select
using (true);

-- Newsletter/audience safety fields used by recent builds
create table if not exists audience_members (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  source text,
  newsletter_opt_in boolean default true,
  created_at timestamptz default now()
);

-- Make sure common submission tables exist so pages do not crash in beta.
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

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  location text,
  town text,
  starts_at timestamptz,
  ends_at timestamptz,
  contact_name text,
  contact_email text,
  status text default 'pending',
  featured boolean default false,
  created_at timestamptz default now()
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
