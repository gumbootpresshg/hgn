-- HGN v148 - Beta Operations Center
-- Defensive migration for online beta operational readiness.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.beta_operations_checks (
  id uuid primary key default gen_random_uuid(),
  check_key text not null,
  check_label text not null,
  area text not null default 'operations',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.beta_operations_checks add column if not exists check_key text;
alter table public.beta_operations_checks add column if not exists check_label text;
alter table public.beta_operations_checks add column if not exists area text default 'operations';
alter table public.beta_operations_checks add column if not exists status text default 'pending';
alter table public.beta_operations_checks add column if not exists priority text default 'normal';
alter table public.beta_operations_checks add column if not exists notes text;
alter table public.beta_operations_checks add column if not exists created_at timestamptz default now();
alter table public.beta_operations_checks add column if not exists updated_at timestamptz default now();

update public.beta_operations_checks
   set check_key = coalesce(check_key, 'beta_operation_' || left(md5(coalesce(id::text, now()::text)), 12)),
       check_label = coalesce(check_label, 'Beta operation check'),
       area = coalesce(area, 'operations'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where check_key is null
    or check_label is null
    or area is null
    or status is null
    or priority is null;

alter table public.beta_operations_checks alter column check_key set not null;
alter table public.beta_operations_checks alter column check_label set not null;
alter table public.beta_operations_checks alter column area set not null;
alter table public.beta_operations_checks alter column status set not null;
alter table public.beta_operations_checks alter column priority set not null;

insert into public.beta_operations_checks (check_key, check_label, area, status, priority, notes)
select 'letters_alert_live_test', 'Letters alert live test', 'submissions', 'pending', 'high',
       'Submit one real test Letter to the Editor and confirm email notification arrives.'
where not exists (
  select 1 from public.beta_operations_checks where check_key = 'letters_alert_live_test'
);

insert into public.beta_operations_checks (check_key, check_label, area, status, priority, notes)
select 'homepage_reader_ready', 'Homepage reader-ready check', 'public_site', 'pending', 'high',
       'Check top homepage story, freshness, mobile view, and tagline before sharing the beta link.'
where not exists (
  select 1 from public.beta_operations_checks where check_key = 'homepage_reader_ready'
);

insert into public.beta_operations_checks (check_key, check_label, area, status, priority, notes)
select 'admin_editor_daily_path', 'Admin/editor daily path', 'workflow', 'ready', 'normal',
       'Use the simplified daily workflow instead of scattered experimental desks.'
where not exists (
  select 1 from public.beta_operations_checks where check_key = 'admin_editor_daily_path'
);

insert into public.beta_operations_checks (check_key, check_label, area, status, priority, notes)
select 'security_basic_lock', 'Basic security lock', 'security', 'pending', 'high',
       'Confirm admin-only pages are not available to anonymous visitors.'
where not exists (
  select 1 from public.beta_operations_checks where check_key = 'security_basic_lock'
);
