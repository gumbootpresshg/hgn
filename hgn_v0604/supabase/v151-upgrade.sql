-- HGN v151 - Reader Trust & Launch Readiness
-- Defensive migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.reader_trust_launch_checks (
  id uuid primary key default gen_random_uuid(),
  trust_key text not null,
  trust_label text not null,
  category text not null default 'reader_trust',
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.reader_trust_launch_checks add column if not exists trust_key text;
alter table public.reader_trust_launch_checks add column if not exists trust_label text;
alter table public.reader_trust_launch_checks add column if not exists category text default 'reader_trust';
alter table public.reader_trust_launch_checks add column if not exists status text default 'pending';
alter table public.reader_trust_launch_checks add column if not exists notes text;

insert into public.reader_trust_launch_checks (
  trust_key, trust_label, category, status, notes
)
select
  'reader_confidence_pass',
  'Reader confidence pass',
  'branding',
  'ready',
  'Confirm the site feels trustworthy, local, and polished before public beta.'
where not exists (
  select 1 from public.reader_trust_launch_checks
  where trust_key = 'reader_confidence_pass'
);

insert into public.reader_trust_launch_checks (
  trust_key, trust_label, category, status, notes
)
select
  'mobile_launch_review',
  'Mobile launch review',
  'reader_experience',
  'pending',
  'Review homepage and article experience on real phones.'
where not exists (
  select 1 from public.reader_trust_launch_checks
  where trust_key = 'mobile_launch_review'
);
