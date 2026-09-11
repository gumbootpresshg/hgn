-- HGN v152 - Public Beta Readiness
-- Defensive migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.public_beta_readiness_checks (
  id uuid primary key default gen_random_uuid(),
  readiness_key text not null,
  readiness_label text not null,
  category text not null default 'public_beta',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.public_beta_readiness_checks add column if not exists readiness_key text;
alter table public.public_beta_readiness_checks add column if not exists readiness_label text;
alter table public.public_beta_readiness_checks add column if not exists category text default 'public_beta';
alter table public.public_beta_readiness_checks add column if not exists status text default 'pending';
alter table public.public_beta_readiness_checks add column if not exists priority text default 'normal';
alter table public.public_beta_readiness_checks add column if not exists notes text;
alter table public.public_beta_readiness_checks add column if not exists created_at timestamptz default now();
alter table public.public_beta_readiness_checks add column if not exists updated_at timestamptz default now();

update public.public_beta_readiness_checks
   set readiness_key = coalesce(readiness_key, 'readiness_' || left(md5(coalesce(id::text, now()::text)), 10)),
       readiness_label = coalesce(readiness_label, 'Public beta readiness check'),
       category = coalesce(category, 'public_beta'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where readiness_key is null
    or readiness_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.public_beta_readiness_checks alter column readiness_key set not null;
alter table public.public_beta_readiness_checks alter column readiness_label set not null;

insert into public.public_beta_readiness_checks (
  readiness_key, readiness_label, category, status, priority, notes
)
select
  'homepage_public_confidence',
  'Homepage public confidence',
  'homepage',
  'pending',
  'high',
  'Confirm the homepage feels ready to share publicly.'
where not exists (
  select 1 from public.public_beta_readiness_checks
  where readiness_key = 'homepage_public_confidence'
);

insert into public.public_beta_readiness_checks (
  readiness_key, readiness_label, category, status, priority, notes
)
select
  'article_mobile_readability',
  'Article mobile readability',
  'mobile',
  'pending',
  'high',
  'Review at least one article on a real phone.'
where not exists (
  select 1 from public.public_beta_readiness_checks
  where readiness_key = 'article_mobile_readability'
);

insert into public.public_beta_readiness_checks (
  readiness_key, readiness_label, category, status, priority, notes
)
select
  'letters_alert_confirmed',
  'Letters alert confirmed',
  'submissions',
  'pending',
  'high',
  'Submit one test Letter to the Editor and confirm the email alert.'
where not exists (
  select 1 from public.public_beta_readiness_checks
  where readiness_key = 'letters_alert_confirmed'
);

insert into public.public_beta_readiness_checks (
  readiness_key, readiness_label, category, status, priority, notes
)
select
  'admin_editor_launch_path',
  'Admin/editor launch path',
  'workflow',
  'ready',
  'normal',
  'Use the simplified launch workflow instead of scattered experimental dashboards.'
where not exists (
  select 1 from public.public_beta_readiness_checks
  where readiness_key = 'admin_editor_launch_path'
);
