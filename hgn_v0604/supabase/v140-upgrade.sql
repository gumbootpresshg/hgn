-- HGN v140 - Online soft beta candidate
-- Defensive migration: safe to rerun after partial attempts.

create extension if not exists pgcrypto;

create table if not exists public.online_soft_beta_gates (
  id uuid primary key default gen_random_uuid(),
  gate_title text not null,
  gate_group text default 'release',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.online_soft_beta_gates add column if not exists gate_title text;
alter table public.online_soft_beta_gates add column if not exists gate_group text default 'release';
alter table public.online_soft_beta_gates add column if not exists status text default 'review';
alter table public.online_soft_beta_gates add column if not exists priority text default 'medium';
alter table public.online_soft_beta_gates add column if not exists owner text default 'Admin / Editor';
alter table public.online_soft_beta_gates add column if not exists notes text;
alter table public.online_soft_beta_gates add column if not exists sort_order integer default 100;
alter table public.online_soft_beta_gates add column if not exists created_at timestamptz default now();
alter table public.online_soft_beta_gates add column if not exists updated_at timestamptz default now();

create table if not exists public.online_soft_beta_route_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text default 'route',
  route_path text,
  expected_result text,
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.online_soft_beta_route_checks add column if not exists check_title text;
alter table public.online_soft_beta_route_checks add column if not exists check_group text default 'route';
alter table public.online_soft_beta_route_checks add column if not exists route_path text;
alter table public.online_soft_beta_route_checks add column if not exists expected_result text;
alter table public.online_soft_beta_route_checks add column if not exists status text default 'review';
alter table public.online_soft_beta_route_checks add column if not exists priority text default 'medium';
alter table public.online_soft_beta_route_checks add column if not exists owner text default 'Admin / Editor';
alter table public.online_soft_beta_route_checks add column if not exists sort_order integer default 100;
alter table public.online_soft_beta_route_checks add column if not exists created_at timestamptz default now();
alter table public.online_soft_beta_route_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.online_soft_beta_deployment_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text default 'deployment',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.online_soft_beta_deployment_checks add column if not exists check_title text;
alter table public.online_soft_beta_deployment_checks add column if not exists check_group text default 'deployment';
alter table public.online_soft_beta_deployment_checks add column if not exists status text default 'review';
alter table public.online_soft_beta_deployment_checks add column if not exists priority text default 'medium';
alter table public.online_soft_beta_deployment_checks add column if not exists owner text default 'Admin / Editor';
alter table public.online_soft_beta_deployment_checks add column if not exists notes text;
alter table public.online_soft_beta_deployment_checks add column if not exists sort_order integer default 100;
alter table public.online_soft_beta_deployment_checks add column if not exists created_at timestamptz default now();
alter table public.online_soft_beta_deployment_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.online_soft_beta_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.online_soft_beta_notes add column if not exists note_title text;
alter table public.online_soft_beta_notes add column if not exists note_body text;
alter table public.online_soft_beta_notes add column if not exists status text default 'open';
alter table public.online_soft_beta_notes add column if not exists owner text default 'Admin / Editor';
alter table public.online_soft_beta_notes add column if not exists created_at timestamptz default now();
alter table public.online_soft_beta_notes add column if not exists updated_at timestamptz default now();

create index if not exists idx_online_soft_beta_gates_status on public.online_soft_beta_gates(status);
create index if not exists idx_online_soft_beta_gates_sort on public.online_soft_beta_gates(sort_order);
create index if not exists idx_online_soft_beta_route_checks_status on public.online_soft_beta_route_checks(status);
create index if not exists idx_online_soft_beta_route_checks_sort on public.online_soft_beta_route_checks(sort_order);
create index if not exists idx_online_soft_beta_deployment_checks_status on public.online_soft_beta_deployment_checks(status);
create index if not exists idx_online_soft_beta_deployment_checks_sort on public.online_soft_beta_deployment_checks(sort_order);

insert into public.online_soft_beta_gates (gate_title, gate_group, status, priority, owner, notes, sort_order)
select * from (values
  ('Lock the soft-beta candidate', 'release', 'review', 'critical', 'Admin / Editor', 'Use this version as the online soft-beta candidate. Avoid new feature work unless it fixes a launch blocker.', 10),
  ('Publish one real story after upload', 'content', 'review', 'critical', 'Admin / Editor', 'Confirm the real public workflow: draft, edit, media, SEO, homepage, mobile article view, and share preview.', 20),
  ('Confirm admin opens cleanly', 'workflow', 'review', 'high', 'Admin', 'The admin path should feel calm for a two-person admin/editor beta, not like a maze of experiments.', 30),
  ('Keep rollback package noted', 'recovery', 'review', 'high', 'Admin', 'Record the last known good zip and SQL version before opening the beta link.', 40)
) as seed(gate_title, gate_group, status, priority, owner, notes, sort_order)
where not exists (select 1 from public.online_soft_beta_gates where online_soft_beta_gates.gate_title = seed.gate_title);

insert into public.online_soft_beta_route_checks (check_title, check_group, route_path, expected_result, status, priority, owner, sort_order)
select * from (values
  ('Homepage first impression passes', 'public route', '/', 'Lead story, local identity, mobile spacing, and navigation look trustworthy.', 'review', 'critical', 'Admin / Editor', 10),
  ('Article reading path passes', 'public route', '/articles', 'Articles are readable on phone, show clear byline/date/media, and have no broken layout.', 'review', 'critical', 'Admin / Editor', 20),
  ('Admin daily path is obvious', 'admin route', '/admin', 'Admin/editor can quickly see what needs publishing next without hunting through old desks.', 'review', 'high', 'Admin / Editor', 30),
  ('Status page renders', 'public-safe route', '/online-soft-beta-status', 'The online soft-beta status page renders a simple candidate snapshot.', 'review', 'medium', 'Admin', 40),
  ('Launch rehearsal remains available', 'admin route', '/admin/launch-rehearsal', 'Previous launch rehearsal workflow remains available for fallback checks.', 'review', 'medium', 'Admin', 50)
) as seed(check_title, check_group, route_path, expected_result, status, priority, owner, sort_order)
where not exists (select 1 from public.online_soft_beta_route_checks where online_soft_beta_route_checks.check_title = seed.check_title);

insert into public.online_soft_beta_deployment_checks (check_title, check_group, status, priority, owner, notes, sort_order)
select * from (values
  ('Production environment variables confirmed', 'deployment', 'review', 'critical', 'Admin', 'Confirm Supabase URL, anon key, site URL, storage, and any publish-time keys are correct for the online beta.', 10),
  ('Latest migration order confirmed', 'database', 'review', 'critical', 'Admin', 'Run the defensive v136 SQL if needed, then v137 through v140 in order if they have not already been applied.', 20),
  ('Mobile smoke test completed', 'mobile', 'review', 'critical', 'Admin / Editor', 'Check homepage, article page, menu, admin login, and one publishing workflow on a phone.', 30),
  ('Unfinished public surfaces hidden', 'cleanup', 'review', 'high', 'Admin', 'Hide or de-emphasize incomplete public pages before sharing the beta URL.', 40),
  ('Rollback note written', 'recovery', 'review', 'high', 'Admin', 'Know the last working zip, SQL state, and hosting rollback option before publishing the link.', 50)
) as seed(check_title, check_group, status, priority, owner, notes, sort_order)
where not exists (select 1 from public.online_soft_beta_deployment_checks where online_soft_beta_deployment_checks.check_title = seed.check_title);

insert into public.online_soft_beta_notes (note_title, note_body, status, owner)
select 'v140 online soft beta candidate', 'This version is intended to be treated as a controlled online beta candidate. Stop expanding, upload, test one real publishing cycle, and fix only launch blockers.', 'open', 'Admin / Editor'
where not exists (select 1 from public.online_soft_beta_notes where note_title = 'v140 online soft beta candidate');
