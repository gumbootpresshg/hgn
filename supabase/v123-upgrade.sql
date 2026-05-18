-- HGN v123 - Daily Route Cleanup
-- Keeps the beta workflow simple for the two-person admin/editor test.

create table if not exists daily_route_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  href text not null default '/admin',
  step_group text not null default 'daily',
  step_status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists daily_route_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_type text not null default 'cleanup',
  note_status text not null default 'open',
  owner_label text not null default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_route_steps_group_idx on daily_route_steps(step_group, step_status, sort_order);
create index if not exists daily_route_notes_status_idx on daily_route_notes(note_status, created_at desc);

insert into daily_route_steps (title, description, href, step_group, step_status, sort_order)
values
  ('Start at Simple Home', 'Use this as the clean admin entry point instead of jumping between every desk.', '/admin/simple-home', 'daily', 'active', 10),
  ('Check Newsroom Hub', 'Look for the main story, blockers, live items, and handoff notes.', '/admin/newsroom-hub', 'daily', 'active', 20),
  ('Use Core Workflow', 'Follow one preferred publishing rhythm instead of several parallel paths.', '/admin/core-workflow', 'daily', 'active', 30),
  ('Run Ship Check', 'Final check for homepage, story basics, media, mobile, and SEO.', '/admin/ship-check', 'daily', 'active', 40),
  ('Use Launch Cleanup', 'Park or hide tools that are not needed for the current beta.', '/admin/launch-cleanup', 'cleanup', 'active', 50),
  ('Review Admin Map', 'Confirm which tools are primary, occasional, parked, or hidden.', '/admin/admin-map', 'cleanup', 'active', 60)
on conflict do nothing;

insert into daily_route_notes (note_title, note_body, note_type, note_status, owner_label)
values
  ('Keep one daily route', 'For beta, the admin/editor workflow should start from Simple Home, then move through Newsroom Hub, Core Workflow, and Ship Check only when needed.', 'workflow', 'open', 'Admin / Editor'),
  ('Park duplicate desks', 'If two tools answer the same question, keep the clearer one in the daily path and move the other into occasional or parked use.', 'cleanup', 'open', 'Admin / Editor')
on conflict do nothing;
