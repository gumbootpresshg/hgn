-- HGN v120 - Core Workflow Consolidation
-- Defines one preferred daily publishing path for the two-person admin/editor beta.

create table if not exists public.core_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  workflow_area text not null default 'publishing',
  step_status text not null default 'active',
  owner text not null default 'Admin / Editor',
  daily_rule text,
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_workflow_routes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  href text not null,
  route_status text not null default 'primary',
  reason text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_workflow_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists core_workflow_steps_status_idx on public.core_workflow_steps(step_status);
create index if not exists core_workflow_steps_area_idx on public.core_workflow_steps(workflow_area);
create index if not exists core_workflow_steps_sort_idx on public.core_workflow_steps(sort_order);
create index if not exists core_workflow_routes_status_idx on public.core_workflow_routes(route_status);
create index if not exists core_workflow_routes_sort_idx on public.core_workflow_routes(sort_order);

insert into public.core_workflow_steps (title, workflow_area, step_status, owner, daily_rule, notes, sort_order)
select 'Pick today''s lead story', 'planning', 'active', 'Admin / Editor', 'Start here before opening several dashboards.', 'Choose the one story or update that should define the day.', 10
where not exists (select 1 from public.core_workflow_steps where title = 'Pick today''s lead story');

insert into public.core_workflow_steps (title, workflow_area, step_status, owner, daily_rule, notes, sort_order)
select 'Check homepage freshness', 'homepage', 'active', 'Admin / Editor', 'Use the frontpage radar before publishing more content.', 'Look for stale hero items, duplicated topics and weak image coverage.', 20
where not exists (select 1 from public.core_workflow_steps where title = 'Check homepage freshness');

insert into public.core_workflow_steps (title, workflow_area, step_status, owner, daily_rule, notes, sort_order)
select 'Run publish sweep', 'publishing', 'active', 'Admin / Editor', 'Use before any important story goes live.', 'Headline, slug, image, caption, alt text, SEO and homepage placement.', 30
where not exists (select 1 from public.core_workflow_steps where title = 'Run publish sweep');

insert into public.core_workflow_steps (title, workflow_area, step_status, owner, daily_rule, notes, sort_order)
select 'Use quickshot only for small updates', 'publishing', 'next', 'Admin / Editor', 'Quickshot is for short local updates, not normal feature publishing.', 'Keeps fast publishing useful without lowering article quality.', 40
where not exists (select 1 from public.core_workflow_steps where title = 'Use quickshot only for small updates');

insert into public.core_workflow_steps (title, workflow_area, step_status, owner, daily_rule, notes, sort_order)
select 'Leave one handoff note', 'wrap', 'active', 'Admin / Editor', 'End with one clear next action for the other person.', 'Avoid long lists. One useful handoff beats ten loose notes.', 50
where not exists (select 1 from public.core_workflow_steps where title = 'Leave one handoff note');

insert into public.core_workflow_routes (title, href, route_status, reason, sort_order)
select 'Newsroom Hub', '/admin/newsroom-hub', 'primary', 'Main consolidated daily view.', 10
where not exists (select 1 from public.core_workflow_routes where title = 'Newsroom Hub');

insert into public.core_workflow_routes (title, href, route_status, reason, sort_order)
select 'Frontpage Radar', '/admin/frontpage-radar', 'primary', 'Homepage freshness and balance check.', 20
where not exists (select 1 from public.core_workflow_routes where title = 'Frontpage Radar');

insert into public.core_workflow_routes (title, href, route_status, reason, sort_order)
select 'Publish Sweep', '/admin/publish-sweep', 'primary', 'Final quality gate before publishing.', 30
where not exists (select 1 from public.core_workflow_routes where title = 'Publish Sweep');

insert into public.core_workflow_routes (title, href, route_status, reason, sort_order)
select 'Admin Map', '/admin/admin-map', 'watch', 'Use when the admin area starts feeling crowded again.', 40
where not exists (select 1 from public.core_workflow_routes where title = 'Admin Map');

insert into public.core_workflow_routes (title, href, route_status, reason, sort_order)
select 'Trim Desk', '/admin/trim-desk', 'parked', 'Use only during cleanup sessions, not daily publishing.', 90
where not exists (select 1 from public.core_workflow_routes where title = 'Trim Desk');

insert into public.core_workflow_notes (note_title, note_body, note_status, owner)
select 'Core workflow rule', 'During the two-person beta, use one main path: Newsroom Hub, Frontpage Radar, Publish Sweep, then one handoff note. Everything else is optional.', 'open', 'Admin / Editor'
where not exists (select 1 from public.core_workflow_notes where note_title = 'Core workflow rule');
