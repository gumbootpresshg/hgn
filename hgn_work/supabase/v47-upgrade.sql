-- HGN v47 Beta Hardening / Safe Patch
-- Safe to run multiple times.

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

create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  source text,
  status text default 'active',
  created_at timestamptz default now()
);

alter table articles add column if not exists homepage_section text;
alter table articles add column if not exists priority integer default 0;
alter table articles add column if not exists editor_notes text;

insert into community_pulse (question, option_one, option_two, option_three, option_four, status)
select
  'What should HGN cover more of this week?',
  'Community events',
  'Local government',
  'Sports',
  'Marketplace / jobs',
  'active'
where not exists (select 1 from community_pulse);

insert into newsroom_assignments (title, description, assigned_to, due_date, status)
select
  'Prepare upcoming edition story list',
  'Collect planned columns, local news, photos, event listings and ad placements for the next print/digital edition.',
  'Newsroom',
  current_date + interval '7 days',
  'open'
where not exists (select 1 from newsroom_assignments where title = 'Prepare upcoming edition story list');
