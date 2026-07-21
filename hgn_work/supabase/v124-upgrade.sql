-- HGN v124 - Beta Freeze Prep
-- Consolidation-first migration for a two-person admin/editor beta.

create table if not exists public.beta_freeze_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  item_group text not null default 'freeze',
  item_status text not null default 'review',
  owner_label text default 'Admin / Editor',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beta_freeze_routes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  href text,
  route_group text not null default 'primary',
  route_status text not null default 'primary',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beta_freeze_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_status text not null default 'open',
  owner_label text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists beta_freeze_items_status_idx on public.beta_freeze_items (item_status);
create index if not exists beta_freeze_routes_status_idx on public.beta_freeze_routes (route_status);
create index if not exists beta_freeze_notes_status_idx on public.beta_freeze_notes (note_status);

insert into public.beta_freeze_items (title, description, item_group, item_status, owner_label, sort_order)
values
  ('Stop adding new desks unless they replace clutter', 'Use this as the freeze rule: new admin tools should consolidate or remove friction, not create another place to check.', 'freeze', 'ready', 'Admin / Editor', 10),
  ('Keep one daily route visible', 'The daily route should be the default path for publishing, homepage checks, and handoff notes.', 'workflow', 'ready', 'Admin / Editor', 20),
  ('Review experimental admin pages', 'Mark duplicate or rarely used screens as parked so they do not distract the beta workflow.', 'cleanup', 'review', 'Admin / Editor', 30),
  ('Clear publish blockers before soft beta', 'Image credit, alt text, mobile article view, homepage freshness, and SEO basics should be checked before calling the beta ready.', 'ship', 'review', 'Admin / Editor', 40),
  ('Avoid big-team language', 'Keep labels grounded in the real workflow: admin/editor, newsroom, daily route, homepage, publish, handoff.', 'language', 'ready', 'Admin / Editor', 50)
on conflict do nothing;

insert into public.beta_freeze_routes (title, description, href, route_group, route_status, sort_order)
values
  ('Simple Admin Home', 'Start here for the cleanest daily admin/editor path.', '/admin/simple-home', 'primary', 'primary', 10),
  ('Daily Route', 'The preferred daily workflow route.', '/admin/daily-route', 'primary', 'primary', 20),
  ('Newsroom Hub', 'Use when you need a wider view of publishing, homepage, and live status.', '/admin/newsroom-hub', 'primary', 'primary', 30),
  ('Launch Cleanup', 'Use for parking clutter and removing beta distractions.', '/admin/launch-cleanup', 'cleanup', 'primary', 40),
  ('Admin Map', 'Use occasionally to decide what should stay visible, parked, or hidden.', '/admin/admin-map', 'cleanup', 'parked', 50),
  ('Older desk pages', 'Keep available for reference, but do not make them part of the daily beta flow.', '/admin', 'archive', 'parked', 60)
on conflict do nothing;

insert into public.beta_freeze_notes (note_title, note_body, note_status, owner_label)
values ('Freeze rule', 'For the next stretch, only add features that simplify the admin/editor workflow or fix launch blockers.', 'open', 'Admin / Editor')
on conflict do nothing;
