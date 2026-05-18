-- HGN v81 - Mobile QA Center
-- Adds mobile beta testing, Lighthouse snapshots, responsive blockers, and public mobile readiness status.

create extension if not exists pgcrypto;

create table if not exists public.mobile_device_tests (
  id uuid primary key default gen_random_uuid(),
  device_name text not null,
  viewport text,
  browser text default 'Safari',
  tester text,
  route_path text not null default '/',
  status text not null default 'untested',
  priority text not null default 'normal',
  notes text,
  tested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mobile_device_tests add column if not exists device_name text;
alter table public.mobile_device_tests add column if not exists viewport text;
alter table public.mobile_device_tests add column if not exists browser text default 'Safari';
alter table public.mobile_device_tests add column if not exists tester text;
alter table public.mobile_device_tests add column if not exists route_path text not null default '/';
alter table public.mobile_device_tests add column if not exists status text not null default 'untested';
alter table public.mobile_device_tests add column if not exists priority text not null default 'normal';
alter table public.mobile_device_tests add column if not exists notes text;
alter table public.mobile_device_tests add column if not exists tested_at timestamptz;
alter table public.mobile_device_tests add column if not exists created_at timestamptz not null default now();
alter table public.mobile_device_tests add column if not exists updated_at timestamptz not null default now();

create table if not exists public.mobile_lighthouse_snapshots (
  id uuid primary key default gen_random_uuid(),
  route_path text not null default '/',
  device_profile text not null default 'mobile',
  performance_score integer,
  accessibility_score integer,
  best_practices_score integer,
  seo_score integer,
  status text not null default 'logged',
  notes text,
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mobile_lighthouse_snapshots add column if not exists route_path text not null default '/';
alter table public.mobile_lighthouse_snapshots add column if not exists device_profile text not null default 'mobile';
alter table public.mobile_lighthouse_snapshots add column if not exists performance_score integer;
alter table public.mobile_lighthouse_snapshots add column if not exists accessibility_score integer;
alter table public.mobile_lighthouse_snapshots add column if not exists best_practices_score integer;
alter table public.mobile_lighthouse_snapshots add column if not exists seo_score integer;
alter table public.mobile_lighthouse_snapshots add column if not exists status text not null default 'logged';
alter table public.mobile_lighthouse_snapshots add column if not exists notes text;
alter table public.mobile_lighthouse_snapshots add column if not exists measured_at timestamptz not null default now();
alter table public.mobile_lighthouse_snapshots add column if not exists created_at timestamptz not null default now();
alter table public.mobile_lighthouse_snapshots add column if not exists updated_at timestamptz not null default now();

create table if not exists public.mobile_launch_blockers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  route_path text,
  area text not null default 'responsive',
  status text not null default 'open',
  priority text not null default 'normal',
  owner text,
  fix_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mobile_launch_blockers add column if not exists title text;
alter table public.mobile_launch_blockers add column if not exists route_path text;
alter table public.mobile_launch_blockers add column if not exists area text not null default 'responsive';
alter table public.mobile_launch_blockers add column if not exists status text not null default 'open';
alter table public.mobile_launch_blockers add column if not exists priority text not null default 'normal';
alter table public.mobile_launch_blockers add column if not exists owner text;
alter table public.mobile_launch_blockers add column if not exists fix_notes text;
alter table public.mobile_launch_blockers add column if not exists resolved_at timestamptz;
alter table public.mobile_launch_blockers add column if not exists created_at timestamptz not null default now();
alter table public.mobile_launch_blockers add column if not exists updated_at timestamptz not null default now();

create index if not exists mobile_device_tests_status_idx on public.mobile_device_tests(status);
create index if not exists mobile_device_tests_route_idx on public.mobile_device_tests(route_path);
create index if not exists mobile_lighthouse_route_idx on public.mobile_lighthouse_snapshots(route_path, measured_at desc);
create index if not exists mobile_launch_blockers_status_idx on public.mobile_launch_blockers(status, priority);

insert into public.mobile_device_tests (device_name, viewport, browser, route_path, status, priority, notes)
select 'iPhone SE / small phone', '375x667', 'Safari', '/', 'untested', 'high', 'Check homepage hierarchy, nav, story cards and utility widgets on a narrow screen.'
where not exists (select 1 from public.mobile_device_tests where device_name = 'iPhone SE / small phone' and route_path = '/');

insert into public.mobile_device_tests (device_name, viewport, browser, route_path, status, priority, notes)
select 'Android mid-size phone', '393x873', 'Chrome', '/articles', 'untested', 'high', 'Check article list readability, tap targets, loading and card spacing.'
where not exists (select 1 from public.mobile_device_tests where device_name = 'Android mid-size phone' and route_path = '/articles');

insert into public.mobile_launch_blockers (title, route_path, area, status, priority, owner, fix_notes)
select 'Confirm mobile article readability before beta', '/articles', 'reading experience', 'open', 'high', 'Editor', 'Validate type size, line length, image captions, bylines, share links and ad spacing on real phones.'
where not exists (select 1 from public.mobile_launch_blockers where title = 'Confirm mobile article readability before beta');

insert into public.mobile_lighthouse_snapshots (route_path, device_profile, performance_score, accessibility_score, best_practices_score, seo_score, status, notes)
select '/', 'mobile', 0, 0, 0, 0, 'needs-run', 'Run Lighthouse against production/beta URL after deploy and replace these placeholder scores.'
where not exists (select 1 from public.mobile_lighthouse_snapshots where route_path = '/' and status = 'needs-run');
