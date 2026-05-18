-- HGN v100 - Beta Ready Core
-- Consolidated lightweight admin/editor readiness layer.

create table if not exists beta_ready_core_tasks (
  id uuid primary key default gen_random_uuid(),
  task_title text not null,
  task_type text not null default 'daily',
  status text not null default 'open',
  owner text not null default 'Admin / Editor',
  is_blocking boolean not null default false,
  sort_order integer not null default 100,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beta_ready_core_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null default current_date,
  readiness_score integer not null default 70,
  headline text not null default 'Daily beta readiness snapshot',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists beta_ready_core_tasks_status_idx on beta_ready_core_tasks(status);
create index if not exists beta_ready_core_tasks_sort_idx on beta_ready_core_tasks(sort_order);
create index if not exists beta_ready_core_snapshots_date_idx on beta_ready_core_snapshots(snapshot_date desc);

insert into beta_ready_core_tasks (task_title, task_type, status, owner, is_blocking, sort_order, notes)
values
  ('Choose the lead story for today', 'homepage', 'open', 'Admin / Editor', true, 10, 'Keep the homepage lead obvious before publishing.'),
  ('Clear final publish blockers', 'publish', 'open', 'Admin / Editor', true, 20, 'Review copy, image, slug and homepage placement before going live.'),
  ('Check mobile homepage and article view', 'mobile', 'open', 'Admin / Editor', false, 30, 'Quick phone check is enough for the two-person beta.'),
  ('Write the daily handoff note', 'handoff', 'open', 'Admin / Editor', false, 40, 'Short note on what changed and what needs attention next.')
on conflict do nothing;

insert into beta_ready_core_snapshots (snapshot_date, readiness_score, headline, notes)
values (current_date, 75, 'v100 beta ready core installed', 'Use /admin/core as the compact daily command page for the admin/editor workflow.')
on conflict do nothing;
