-- HGN v137 - Launch Fix Pack
-- Defensive migration for online soft-beta launch repair and final route checks.

create extension if not exists pgcrypto;

create table if not exists public.launch_fix_pack_items (
  id uuid primary key default gen_random_uuid(),
  item_title text not null,
  item_group text default 'release',
  status text default 'review',
  severity text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.launch_fix_pack_items add column if not exists item_title text;
alter table public.launch_fix_pack_items add column if not exists item_group text default 'release';
alter table public.launch_fix_pack_items add column if not exists status text default 'review';
alter table public.launch_fix_pack_items add column if not exists severity text default 'medium';
alter table public.launch_fix_pack_items add column if not exists owner text default 'Admin / Editor';
alter table public.launch_fix_pack_items add column if not exists notes text;
alter table public.launch_fix_pack_items add column if not exists sort_order integer default 100;
alter table public.launch_fix_pack_items add column if not exists created_at timestamptz default now();
alter table public.launch_fix_pack_items add column if not exists updated_at timestamptz default now();

create table if not exists public.launch_fix_sql_guards (
  id uuid primary key default gen_random_uuid(),
  guard_title text not null,
  guard_group text default 'sql',
  status text default 'review',
  severity text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.launch_fix_sql_guards add column if not exists guard_title text;
alter table public.launch_fix_sql_guards add column if not exists guard_group text default 'sql';
alter table public.launch_fix_sql_guards add column if not exists status text default 'review';
alter table public.launch_fix_sql_guards add column if not exists severity text default 'medium';
alter table public.launch_fix_sql_guards add column if not exists owner text default 'Admin / Editor';
alter table public.launch_fix_sql_guards add column if not exists notes text;
alter table public.launch_fix_sql_guards add column if not exists sort_order integer default 100;
alter table public.launch_fix_sql_guards add column if not exists created_at timestamptz default now();
alter table public.launch_fix_sql_guards add column if not exists updated_at timestamptz default now();

create table if not exists public.launch_fix_route_checks (
  id uuid primary key default gen_random_uuid(),
  route_label text not null,
  route_path text not null,
  status text default 'review',
  severity text default 'medium',
  expected_result text,
  owner text default 'Admin / Editor',
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.launch_fix_route_checks add column if not exists route_label text;
alter table public.launch_fix_route_checks add column if not exists route_path text;
alter table public.launch_fix_route_checks add column if not exists status text default 'review';
alter table public.launch_fix_route_checks add column if not exists severity text default 'medium';
alter table public.launch_fix_route_checks add column if not exists expected_result text;
alter table public.launch_fix_route_checks add column if not exists owner text default 'Admin / Editor';
alter table public.launch_fix_route_checks add column if not exists sort_order integer default 100;
alter table public.launch_fix_route_checks add column if not exists created_at timestamptz default now();
alter table public.launch_fix_route_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.launch_fix_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.launch_fix_notes add column if not exists note_title text;
alter table public.launch_fix_notes add column if not exists note_body text;
alter table public.launch_fix_notes add column if not exists status text default 'open';
alter table public.launch_fix_notes add column if not exists owner text default 'Admin / Editor';
alter table public.launch_fix_notes add column if not exists created_at timestamptz default now();
alter table public.launch_fix_notes add column if not exists updated_at timestamptz default now();

create index if not exists launch_fix_pack_items_status_idx on public.launch_fix_pack_items(status);
create index if not exists launch_fix_pack_items_sort_idx on public.launch_fix_pack_items(sort_order);
create index if not exists launch_fix_sql_guards_status_idx on public.launch_fix_sql_guards(status);
create index if not exists launch_fix_route_checks_status_idx on public.launch_fix_route_checks(status);

insert into public.launch_fix_pack_items (item_title, item_group, status, severity, owner, notes, sort_order)
select 'Confirm v136 defensive SQL is applied', 'database', 'review', 'critical', 'Admin / Editor', 'The failed owner-column migration should be repaired before v137 is considered clean.', 10
where not exists (select 1 from public.launch_fix_pack_items where item_title = 'Confirm v136 defensive SQL is applied');

insert into public.launch_fix_pack_items (item_title, item_group, status, severity, owner, notes, sort_order)
select 'Run one full publish path after migration', 'newsroom', 'review', 'high', 'Admin / Editor', 'Open admin, edit or create a story, add media metadata, place it on the homepage, and view it on mobile.', 20
where not exists (select 1 from public.launch_fix_pack_items where item_title = 'Run one full publish path after migration');

insert into public.launch_fix_pack_items (item_title, item_group, status, severity, owner, notes, sort_order)
select 'Freeze new feature desks until upload', 'scope', 'review', 'high', 'Admin / Editor', 'Keep the next work focused on polish, deployment, and real publishing tests.', 30
where not exists (select 1 from public.launch_fix_pack_items where item_title = 'Freeze new feature desks until upload');

insert into public.launch_fix_sql_guards (guard_title, guard_group, status, severity, owner, notes, sort_order)
select 'Use add column if not exists before inserts', 'migration safety', 'ready', 'critical', 'Admin / Editor', 'All new v137 tables and columns are created defensively so partial reruns are safer.', 10
where not exists (select 1 from public.launch_fix_sql_guards where guard_title = 'Use add column if not exists before inserts');

insert into public.launch_fix_sql_guards (guard_title, guard_group, status, severity, owner, notes, sort_order)
select 'Avoid backslash SQL escaping', 'migration safety', 'ready', 'high', 'Admin / Editor', 'SQL strings use standard Postgres quote handling and avoid backslash-escaped apostrophes.', 20
where not exists (select 1 from public.launch_fix_sql_guards where guard_title = 'Avoid backslash SQL escaping');

insert into public.launch_fix_route_checks (route_label, route_path, status, severity, expected_result, owner, sort_order)
select 'Admin launch fix pack', '/admin/launch-fix-pack', 'review', 'high', 'Loads without syntax errors and shows the current fix confidence.', 'Admin / Editor', 10
where not exists (select 1 from public.launch_fix_route_checks where route_path = '/admin/launch-fix-pack');

insert into public.launch_fix_route_checks (route_label, route_path, status, severity, expected_result, owner, sort_order)
select 'Launch fix public status', '/launch-fix-status', 'review', 'medium', 'Loads as a simple public-safe status page.', 'Admin / Editor', 20
where not exists (select 1 from public.launch_fix_route_checks where route_path = '/launch-fix-status');

insert into public.launch_fix_route_checks (route_label, route_path, status, severity, expected_result, owner, sort_order)
select 'Soft beta deployment suite', '/admin/soft-beta-deployment', 'review', 'critical', 'The v136 deployment screen loads after the defensive patch.', 'Admin / Editor', 30
where not exists (select 1 from public.launch_fix_route_checks where route_path = '/admin/soft-beta-deployment');

insert into public.launch_fix_notes (note_title, note_body, status, owner)
select 'v137 launch fix note', 'Use this pass to repair partial SQL issues, verify the deployment suite, and keep the site moving toward online soft beta.', 'open', 'Admin / Editor'
where not exists (select 1 from public.launch_fix_notes where note_title = 'v137 launch fix note');
