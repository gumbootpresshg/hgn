-- HGN v150 - Soft Beta Command Center
-- Defensive migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.soft_beta_command_center (
  id uuid primary key default gen_random_uuid(),
  command_key text not null,
  command_label text not null,
  category text not null default 'launch',
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.soft_beta_command_center add column if not exists command_key text;
alter table public.soft_beta_command_center add column if not exists command_label text;
alter table public.soft_beta_command_center add column if not exists category text default 'launch';
alter table public.soft_beta_command_center add column if not exists status text default 'pending';
alter table public.soft_beta_command_center add column if not exists notes text;

insert into public.soft_beta_command_center (
  command_key, command_label, category, status, notes
)
select
  'public_beta_link_check',
  'Public beta link check',
  'launch',
  'pending',
  'Confirm the public homepage is ready before sharing externally.'
where not exists (
  select 1 from public.soft_beta_command_center
  where command_key = 'public_beta_link_check'
);

insert into public.soft_beta_command_center (
  command_key, command_label, category, status, notes
)
select
  'reader_trust_pass',
  'Reader trust pass',
  'reader_experience',
  'ready',
  'Free, Independent, Local. branding and trust polish check.'
where not exists (
  select 1 from public.soft_beta_command_center
  where command_key = 'reader_trust_pass'
);
