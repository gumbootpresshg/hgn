-- HGN v116 - Frontpage Radar
-- Lightweight homepage/frontpage issue tracker for the two-person admin/editor beta workflow.

create table if not exists public.frontpage_radar_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_area text not null default 'homepage',
  item_status text not null default 'open',
  severity text not null default 'watch',
  owner text not null default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.frontpage_radar_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'homepage',
  check_status text not null default 'open',
  helper text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.frontpage_radar_runs (
  id uuid primary key default gen_random_uuid(),
  run_label text not null,
  run_status text not null default 'open',
  frontpage_score integer not null default 78,
  summary text,
  next_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists frontpage_radar_items_status_idx on public.frontpage_radar_items(item_status);
create index if not exists frontpage_radar_items_area_idx on public.frontpage_radar_items(item_area);
create index if not exists frontpage_radar_items_severity_idx on public.frontpage_radar_items(severity);
create index if not exists frontpage_radar_items_sort_idx on public.frontpage_radar_items(sort_order);
create index if not exists frontpage_radar_checks_sort_idx on public.frontpage_radar_checks(sort_order);
create index if not exists frontpage_radar_runs_status_idx on public.frontpage_radar_runs(run_status);

insert into public.frontpage_radar_items (title, item_area, item_status, severity, owner, notes, sort_order)
select 'Hero story needs a freshness decision', 'hero', 'open', 'watch', 'Admin / Editor', 'Keep, replace or deliberately carry the lead story forward.', 10
where not exists (select 1 from public.frontpage_radar_items where title = 'Hero story needs a freshness decision');

insert into public.frontpage_radar_items (title, item_area, item_status, severity, owner, notes, sort_order)
select 'Check for repeated story topics on the frontpage', 'balance', 'open', 'watch', 'Admin / Editor', 'The homepage should not accidentally feel like one narrow topic all day.', 20
where not exists (select 1 from public.frontpage_radar_items where title = 'Check for repeated story topics on the frontpage');

insert into public.frontpage_radar_items (title, item_area, item_status, severity, owner, notes, sort_order)
select 'Confirm key stories have usable images', 'media', 'open', 'needs-look', 'Admin / Editor', 'Weak images make the frontpage feel unfinished even when stories are ready.', 30
where not exists (select 1 from public.frontpage_radar_items where title = 'Confirm key stories have usable images');

insert into public.frontpage_radar_checks (title, check_area, check_status, helper, sort_order)
select 'Hero slot has been reviewed today', 'hero', 'open', 'Make one clear keep or replace decision.', 10
where not exists (select 1 from public.frontpage_radar_checks where title = 'Hero slot has been reviewed today');

insert into public.frontpage_radar_checks (title, check_area, check_status, helper, sort_order)
select 'Frontpage has a healthy mix of local priorities', 'balance', 'open', 'Check news, community, service info and evergreen balance.', 20
where not exists (select 1 from public.frontpage_radar_checks where title = 'Frontpage has a healthy mix of local priorities');

insert into public.frontpage_radar_checks (title, check_area, check_status, helper, sort_order)
select 'No obvious stale or duplicate cards', 'freshness', 'open', 'Scan for old, repeated or weak placements before sharing widely.', 30
where not exists (select 1 from public.frontpage_radar_checks where title = 'No obvious stale or duplicate cards');

insert into public.frontpage_radar_runs (run_label, run_status, frontpage_score, summary, next_step)
select 'Frontpage radar pass', 'open', 78, 'A small frontpage scan for the admin/editor beta workflow.', 'Clear the highest severity homepage issue first.'
where not exists (select 1 from public.frontpage_radar_runs where run_label = 'Frontpage radar pass');
