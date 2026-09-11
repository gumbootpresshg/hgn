-- HGN v121 - Launch Cleanup
-- Consolidation-focused cleanup layer for a two-person admin/editor beta.

create table if not exists public.launch_cleanup_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_area text not null default 'admin',
  item_status text not null default 'today',
  owner text not null default 'Admin / Editor',
  cleanup_note text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.launch_cleanup_routes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  href text,
  route_status text not null default 'review',
  reason text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.launch_cleanup_notes (
  id uuid primary key default gen_random_uuid(),
  note text not null,
  note_type text not null default 'cleanup',
  owner text not null default 'Admin / Editor',
  created_at timestamptz not null default now()
);

create index if not exists launch_cleanup_items_status_idx on public.launch_cleanup_items(item_status);
create index if not exists launch_cleanup_items_area_idx on public.launch_cleanup_items(item_area);
create index if not exists launch_cleanup_routes_status_idx on public.launch_cleanup_routes(route_status);

insert into public.launch_cleanup_items (title, item_area, item_status, owner, cleanup_note, sort_order)
values
  ('Use Newsroom Hub as the main starting point', 'admin', 'today', 'Admin / Editor', 'Keep the daily path centered around one primary dashboard instead of many desks.', 10),
  ('Park duplicate daily planning pages', 'navigation', 'review', 'Admin / Editor', 'If a page repeats Today Board, Morning Desk, Focus Board, or Core Workflow, mark it as occasional or parked.', 20),
  ('Keep homepage checks in one path', 'homepage', 'today', 'Admin / Editor', 'Frontpage radar, stale check, and homepage control should feed the same launch decision.', 30),
  ('Review public status pages before soft beta', 'public-site', 'review', 'Admin / Editor', 'Hide or polish anything that feels too internal for readers.', 40),
  ('Do not add another desk unless it replaces two others', 'admin', 'done', 'Admin / Editor', 'This is the new rule for the consolidation phase.', 50)
on conflict do nothing;

insert into public.launch_cleanup_routes (title, href, route_status, reason, sort_order)
values
  ('Newsroom Hub', '/admin/newsroom-hub', 'ready', 'Primary starting point for the two-person workflow.', 10),
  ('Core Workflow', '/admin/core-workflow', 'ready', 'Defines the preferred publishing rhythm.', 20),
  ('Admin Map', '/admin/admin-map', 'review', 'Use to decide what stays visible, occasional, parked, or hidden.', 30),
  ('Launch Cleanup', '/admin/launch-cleanup', 'ready', 'Current consolidation desk.', 40),
  ('Older mini desks', '/admin', 'parked', 'Keep available, but do not make them the daily path.', 90)
on conflict do nothing;

insert into public.launch_cleanup_notes (note, note_type, owner)
values ('v121 starts the cleanup-first phase: simplify before adding new systems.', 'release-note', 'Admin / Editor')
on conflict do nothing;
