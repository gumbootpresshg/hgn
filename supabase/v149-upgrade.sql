-- HGN v149 - Public Launch Confidence
-- Defensive migration for public-facing launch confidence and trust checks.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.public_launch_confidence (
  id uuid primary key default gen_random_uuid(),
  confidence_key text not null,
  confidence_label text not null,
  category text not null default 'public',
  status text not null default 'pending',
  impact_level text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.public_launch_confidence add column if not exists confidence_key text;
alter table public.public_launch_confidence add column if not exists confidence_label text;
alter table public.public_launch_confidence add column if not exists category text default 'public';
alter table public.public_launch_confidence add column if not exists status text default 'pending';
alter table public.public_launch_confidence add column if not exists impact_level text default 'normal';
alter table public.public_launch_confidence add column if not exists notes text;
alter table public.public_launch_confidence add column if not exists created_at timestamptz default now();
alter table public.public_launch_confidence add column if not exists updated_at timestamptz default now();

update public.public_launch_confidence
set confidence_key = coalesce(confidence_key, 'launch_conf_' || left(md5(coalesce(id::text, now()::text)), 10)),
    confidence_label = coalesce(confidence_label, 'Public launch confidence check'),
    category = coalesce(category, 'public'),
    status = coalesce(status, 'pending'),
    impact_level = coalesce(impact_level, 'normal'),
    updated_at = now()
where confidence_key is null
   or confidence_label is null;

insert into public.public_launch_confidence (
  confidence_key, confidence_label, category, status, impact_level, notes
)
select
  'mobile_story_readability',
  'Mobile story readability',
  'reader_experience',
  'pending',
  'high',
  'Check article readability, spacing, and image crops on phones.'
where not exists (
  select 1 from public.public_launch_confidence
  where confidence_key = 'mobile_story_readability'
);

insert into public.public_launch_confidence (
  confidence_key, confidence_label, category, status, impact_level, notes
)
select
  'homepage_trust_signal',
  'Homepage trust signal',
  'branding',
  'ready',
  'high',
  'Confirm Free, Independent, Local. appears consistently.'
where not exists (
  select 1 from public.public_launch_confidence
  where confidence_key = 'homepage_trust_signal'
);

insert into public.public_launch_confidence (
  confidence_key, confidence_label, category, status, impact_level, notes
)
select
  'public_submission_flow',
  'Public submission flow',
  'submissions',
  'pending',
  'high',
  'Submit a real Letter to the Editor and verify private handling plus alerts.'
where not exists (
  select 1 from public.public_launch_confidence
  where confidence_key = 'public_submission_flow'
);

insert into public.public_launch_confidence (
  confidence_key, confidence_label, category, status, impact_level, notes
)
select
  'soft_beta_share_readiness',
  'Soft beta share readiness',
  'launch',
  'pending',
  'high',
  'Would you feel comfortable sharing the homepage publicly today?'
where not exists (
  select 1 from public.public_launch_confidence
  where confidence_key = 'soft_beta_share_readiness'
);
