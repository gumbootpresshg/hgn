-- HGN v115 - Stale Check
-- Lightweight freshness tracker for the two-person admin/editor beta workflow.

create table if not exists public.stale_check_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_area text not null default 'homepage',
  item_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  age_hours integer not null default 0,
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stale_check_rules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rule_area text not null default 'site',
  is_enabled boolean not null default true,
  helper text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stale_check_runs (
  id uuid primary key default gen_random_uuid(),
  run_label text not null,
  run_status text not null default 'open',
  freshness_score integer not null default 75,
  summary text,
  next_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stale_check_items_status_idx on public.stale_check_items(item_status);
create index if not exists stale_check_items_area_idx on public.stale_check_items(item_area);
create index if not exists stale_check_items_sort_idx on public.stale_check_items(sort_order);
create index if not exists stale_check_rules_sort_idx on public.stale_check_rules(sort_order);
create index if not exists stale_check_runs_status_idx on public.stale_check_runs(run_status);

insert into public.stale_check_items (title, item_area, item_status, owner, age_hours, notes, sort_order)
select 'Check whether the homepage lead still feels current', 'homepage', 'open', 'Admin / Editor', 12, 'A small local site can feel old fast if the hero slot is left too long.', 10
where not exists (select 1 from public.stale_check_items where title = 'Check whether the homepage lead still feels current');

insert into public.stale_check_items (title, item_area, item_status, owner, age_hours, notes, sort_order)
select 'Review drafts that are close but not published', 'draft', 'open', 'Admin / Editor', 6, 'Decide whether each near-ready draft ships, waits or gets dropped.', 20
where not exists (select 1 from public.stale_check_items where title = 'Review drafts that are close but not published');

insert into public.stale_check_items (title, item_area, item_status, owner, age_hours, notes, sort_order)
select 'Clean up missing media captions or alt text', 'media', 'open', 'Admin / Editor', 4, 'These small details make the site feel more finished.', 30
where not exists (select 1 from public.stale_check_items where title = 'Clean up missing media captions or alt text');

insert into public.stale_check_rules (title, rule_area, is_enabled, helper, sort_order)
select 'Homepage lead should be reviewed daily', 'homepage', true, 'Make an intentional keep or replace decision each publishing day.', 10
where not exists (select 1 from public.stale_check_rules where title = 'Homepage lead should be reviewed daily');

insert into public.stale_check_rules (title, rule_area, is_enabled, helper, sort_order)
select 'Near-ready drafts need a clear next step', 'draft', true, 'Do not let almost-finished stories sit without a decision.', 20
where not exists (select 1 from public.stale_check_rules where title = 'Near-ready drafts need a clear next step');

insert into public.stale_check_rules (title, rule_area, is_enabled, helper, sort_order)
select 'Media details should be checked before sharing', 'media', true, 'Credit, caption and alt text should be present on important stories.', 30
where not exists (select 1 from public.stale_check_rules where title = 'Media details should be checked before sharing');

insert into public.stale_check_runs (run_label, run_status, freshness_score, summary, next_step)
select 'Daily freshness check', 'open', 75, 'Tiny freshness pass for the admin/editor beta workflow.', 'Clear the urgent item or intentionally carry it forward.'
where not exists (select 1 from public.stale_check_runs where run_label = 'Daily freshness check');
