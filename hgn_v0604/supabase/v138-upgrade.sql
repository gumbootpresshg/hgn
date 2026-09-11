-- HGN v138 - Production Lock
-- Defensive migration for final online soft-beta upload readiness.

create extension if not exists pgcrypto;

create table if not exists public.production_lock_items (
  id uuid primary key default gen_random_uuid(),
  item_title text not null,
  item_group text default 'deployment',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.production_lock_items add column if not exists item_title text;
alter table public.production_lock_items add column if not exists item_group text default 'deployment';
alter table public.production_lock_items add column if not exists status text default 'review';
alter table public.production_lock_items add column if not exists priority text default 'medium';
alter table public.production_lock_items add column if not exists owner text default 'Admin / Editor';
alter table public.production_lock_items add column if not exists notes text;
alter table public.production_lock_items add column if not exists sort_order integer default 100;
alter table public.production_lock_items add column if not exists created_at timestamptz default now();
alter table public.production_lock_items add column if not exists updated_at timestamptz default now();

create table if not exists public.production_lock_smoke_tests (
  id uuid primary key default gen_random_uuid(),
  test_title text not null,
  test_group text default 'public route',
  route_path text,
  expected_result text,
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.production_lock_smoke_tests add column if not exists test_title text;
alter table public.production_lock_smoke_tests add column if not exists test_group text default 'public route';
alter table public.production_lock_smoke_tests add column if not exists route_path text;
alter table public.production_lock_smoke_tests add column if not exists expected_result text;
alter table public.production_lock_smoke_tests add column if not exists status text default 'review';
alter table public.production_lock_smoke_tests add column if not exists priority text default 'medium';
alter table public.production_lock_smoke_tests add column if not exists owner text default 'Admin / Editor';
alter table public.production_lock_smoke_tests add column if not exists sort_order integer default 100;
alter table public.production_lock_smoke_tests add column if not exists created_at timestamptz default now();
alter table public.production_lock_smoke_tests add column if not exists updated_at timestamptz default now();

create table if not exists public.production_lock_rollback_items (
  id uuid primary key default gen_random_uuid(),
  rollback_title text not null,
  rollback_group text default 'recovery',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.production_lock_rollback_items add column if not exists rollback_title text;
alter table public.production_lock_rollback_items add column if not exists rollback_group text default 'recovery';
alter table public.production_lock_rollback_items add column if not exists status text default 'review';
alter table public.production_lock_rollback_items add column if not exists priority text default 'medium';
alter table public.production_lock_rollback_items add column if not exists owner text default 'Admin / Editor';
alter table public.production_lock_rollback_items add column if not exists notes text;
alter table public.production_lock_rollback_items add column if not exists sort_order integer default 100;
alter table public.production_lock_rollback_items add column if not exists created_at timestamptz default now();
alter table public.production_lock_rollback_items add column if not exists updated_at timestamptz default now();

create table if not exists public.production_lock_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.production_lock_notes add column if not exists note_title text;
alter table public.production_lock_notes add column if not exists note_body text;
alter table public.production_lock_notes add column if not exists status text default 'open';
alter table public.production_lock_notes add column if not exists owner text default 'Admin / Editor';
alter table public.production_lock_notes add column if not exists created_at timestamptz default now();
alter table public.production_lock_notes add column if not exists updated_at timestamptz default now();

create index if not exists idx_production_lock_items_status on public.production_lock_items(status);
create index if not exists idx_production_lock_items_sort on public.production_lock_items(sort_order);
create index if not exists idx_production_lock_smoke_tests_status on public.production_lock_smoke_tests(status);
create index if not exists idx_production_lock_smoke_tests_sort on public.production_lock_smoke_tests(sort_order);
create index if not exists idx_production_lock_rollback_items_status on public.production_lock_rollback_items(status);
create index if not exists idx_production_lock_rollback_items_sort on public.production_lock_rollback_items(sort_order);

insert into public.production_lock_items (item_title, item_group, status, priority, owner, notes, sort_order)
select * from (values
  ('Feature freeze is respected', 'freeze', 'review', 'critical', 'Admin / Editor', 'Stop adding new surfaces unless they remove a launch blocker. Keep the site stable for online beta.', 10),
  ('Production environment variables are checked', 'deployment', 'review', 'critical', 'Admin', 'Confirm Supabase URL/key, production site URL, image domains, auth redirects, and deploy platform variables.', 20),
  ('One real story publishes end to end', 'newsroom', 'review', 'high', 'Admin / Editor', 'Edit one real article, check image metadata, homepage placement, mobile view, RSS/sitemap visibility, and public article rendering.', 30),
  ('Homepage looks fresh on mobile', 'public polish', 'review', 'high', 'Admin / Editor', 'Check hero, cards, images, utilities, spacing, and the first screen on a phone before upload.', 40),
  ('Experimental routes are hidden from navigation', 'cleanup', 'review', 'medium', 'Admin', 'Do not remove useful files yet. Hide or de-emphasize unfinished paths so beta testing feels focused.', 50)
) as seed(item_title, item_group, status, priority, owner, notes, sort_order)
where not exists (select 1 from public.production_lock_items where production_lock_items.item_title = seed.item_title);

insert into public.production_lock_smoke_tests (test_title, test_group, route_path, expected_result, status, priority, owner, sort_order)
select * from (values
  ('Homepage loads cleanly', 'public route', '/', 'Homepage renders without obvious layout breakage on desktop and mobile.', 'review', 'critical', 'Admin / Editor', 10),
  ('Article page loads cleanly', 'public route', '/articles', 'Article listing and at least one article path render correctly.', 'review', 'critical', 'Admin / Editor', 20),
  ('Admin home opens', 'admin route', '/admin', 'Admin home shows the simplified workflow and does not bury the primary daily path.', 'review', 'high', 'Admin', 30),
  ('Soft beta launch tools open', 'admin route', '/admin/soft-beta-deployment', 'Deployment suite and launch fix pack remain available if upload issues appear.', 'review', 'medium', 'Admin', 40),
  ('Production lock status opens', 'public-safe route', '/production-lock-status', 'Status page renders a simple upload readiness snapshot.', 'review', 'medium', 'Admin', 50)
) as seed(test_title, test_group, route_path, expected_result, status, priority, owner, sort_order)
where not exists (select 1 from public.production_lock_smoke_tests where production_lock_smoke_tests.test_title = seed.test_title);

insert into public.production_lock_rollback_items (rollback_title, rollback_group, status, priority, owner, notes, sort_order)
select * from (values
  ('Keep the last known good zip', 'recovery', 'review', 'critical', 'Admin', 'Save the latest working package before uploading v138 so rollback is simple if deployment fails.', 10),
  ('Document SQL order', 'database', 'review', 'high', 'Admin', 'Run missing migrations in order and use defensive patched SQL when a partial migration has already created a table.', 20),
  ('Know how to disable a broken route', 'recovery', 'review', 'medium', 'Admin', 'If a new route fails, remove the navigation link first and patch the route after the site is stable.', 30)
) as seed(rollback_title, rollback_group, status, priority, owner, notes, sort_order)
where not exists (select 1 from public.production_lock_rollback_items where production_lock_rollback_items.rollback_title = seed.rollback_title);

insert into public.production_lock_notes (note_title, note_body, status, owner)
select 'v138 production lock note', 'This version is for upload confidence: freeze scope, run smoke tests, check mobile, and keep the admin/editor path simple.', 'open', 'Admin / Editor'
where not exists (select 1 from public.production_lock_notes where note_title = 'v138 production lock note');
