-- HGN v46 Daily Use + Community Pulse upgrade
-- Safe/idempotent table setup for beta hardening.

create table if not exists community_polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  option_a text default 'Yes',
  option_b text default 'No',
  option_c text,
  status text default 'active',
  featured boolean default false,
  created_at timestamptz default now(),
  closes_at timestamptz
);

create table if not exists community_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references community_polls(id) on delete cascade,
  choice text not null,
  voter_fingerprint text,
  created_at timestamptz default now()
);

create table if not exists newsroom_assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  section text,
  assigned_to text,
  due_date date,
  notes text,
  status text default 'idea',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists contributor_plans (
  id uuid primary key default gen_random_uuid(),
  contributor_name text,
  contributor_email text,
  edition_date date,
  contribution_type text,
  length text,
  needs_photos boolean default false,
  notes text,
  status text default 'planned',
  created_at timestamptz default now()
);

create table if not exists daily_desk_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text default 'note',
  priority text default 'normal',
  details text,
  link_url text,
  status text default 'open',
  created_at timestamptz default now(),
  expires_at timestamptz
);

alter table events add column if not exists featured boolean default false;
alter table events add column if not exists town text;
alter table events add column if not exists start_time timestamptz;
alter table events add column if not exists end_time timestamptz;
alter table events add column if not exists contact_email text;
alter table events add column if not exists newsletter_opt_in boolean default false;

alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists section text;
alter table articles add column if not exists newsletter_opt_in boolean default false;

insert into community_polls (question, option_a, option_b, option_c, status, featured)
select 'What should HGN cover more of this month?', 'Local government', 'Community events', 'Sports and youth', 'active', true
where not exists (select 1 from community_polls where question = 'What should HGN cover more of this month?');

insert into daily_desk_items (title, item_type, priority, details, status)
select 'Check today’s events and notices', 'editorial', 'high', 'Review submitted events, notices and obituaries before the morning update.', 'open'
where not exists (select 1 from daily_desk_items where title = 'Check today’s events and notices');

insert into newsroom_assignments (title, section, assigned_to, due_date, notes, status)
select 'Weekend events roundup', 'Events', 'Newsroom', current_date + interval '2 days', 'Pull approved events into a weekend listing and homepage card.', 'idea'
where not exists (select 1 from newsroom_assignments where title = 'Weekend events roundup');
