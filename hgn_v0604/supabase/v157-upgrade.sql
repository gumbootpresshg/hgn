-- HGN v157 - Public Newsroom Ops
-- Defensive migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.public_newsroom_ops_checks (
  id uuid primary key default gen_random_uuid(),
  ops_key text not null,
  ops_label text not null,
  category text not null default 'newsroom',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.public_newsroom_ops_checks add column if not exists ops_key text;
alter table public.public_newsroom_ops_checks add column if not exists ops_label text;
alter table public.public_newsroom_ops_checks add column if not exists category text default 'newsroom';
alter table public.public_newsroom_ops_checks add column if not exists status text default 'pending';
alter table public.public_newsroom_ops_checks add column if not exists priority text default 'normal';
alter table public.public_newsroom_ops_checks add column if not exists notes text;
alter table public.public_newsroom_ops_checks add column if not exists created_at timestamptz default now();
alter table public.public_newsroom_ops_checks add column if not exists updated_at timestamptz default now();

update public.public_newsroom_ops_checks
   set ops_key = coalesce(ops_key, 'newsroom_ops_' || left(md5(coalesce(id::text, now()::text)), 10)),
       ops_label = coalesce(ops_label, 'Public newsroom ops check'),
       category = coalesce(category, 'newsroom'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where ops_key is null
    or ops_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.public_newsroom_ops_checks alter column ops_key set not null;
alter table public.public_newsroom_ops_checks alter column ops_label set not null;

insert into public.public_newsroom_ops_checks (ops_key, ops_label, category, status, priority, notes)
select 'homepage_freshness_discipline', 'Homepage freshness discipline', 'homepage', 'pending', 'high',
       'Check the homepage at least once per publishing session for stale lead stories and weak ordering.'
where not exists (
  select 1 from public.public_newsroom_ops_checks where ops_key = 'homepage_freshness_discipline'
);

insert into public.public_newsroom_ops_checks (ops_key, ops_label, category, status, priority, notes)
select 'letters_moderation_flow', 'Letters moderation flow', 'submissions', 'pending', 'high',
       'Review Letters to the Editor privately before any public use.'
where not exists (
  select 1 from public.public_newsroom_ops_checks where ops_key = 'letters_moderation_flow'
);

insert into public.public_newsroom_ops_checks (ops_key, ops_label, category, status, priority, notes)
select 'daily_publish_rhythm', 'Daily publish rhythm', 'publishing', 'ready', 'normal',
       'Keep one simple admin/editor rhythm: plan, publish, homepage check, wrap.'
where not exists (
  select 1 from public.public_newsroom_ops_checks where ops_key = 'daily_publish_rhythm'
);

insert into public.public_newsroom_ops_checks (ops_key, ops_label, category, status, priority, notes)
select 'live_update_coordination', 'Live update coordination', 'live', 'pending', 'normal',
       'Use live update flow only for urgent or developing stories.'
where not exists (
  select 1 from public.public_newsroom_ops_checks where ops_key = 'live_update_coordination'
);
