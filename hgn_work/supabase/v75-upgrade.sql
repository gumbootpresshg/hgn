-- HGN v75 - Emergency Desk / Public Safety Readiness
-- Defensive beta migration: safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.emergency_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  update_type text not null default 'community',
  severity text not null default 'watch',
  status text not null default 'draft',
  location text,
  summary text,
  official_source text,
  official_url text,
  instructions text,
  verified_by text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.emergency_updates add column if not exists title text;
alter table public.emergency_updates add column if not exists update_type text not null default 'community';
alter table public.emergency_updates add column if not exists severity text not null default 'watch';
alter table public.emergency_updates add column if not exists status text not null default 'draft';
alter table public.emergency_updates add column if not exists location text;
alter table public.emergency_updates add column if not exists summary text;
alter table public.emergency_updates add column if not exists official_source text;
alter table public.emergency_updates add column if not exists official_url text;
alter table public.emergency_updates add column if not exists instructions text;
alter table public.emergency_updates add column if not exists verified_by text;
alter table public.emergency_updates add column if not exists published_at timestamptz;
alter table public.emergency_updates add column if not exists expires_at timestamptz;
alter table public.emergency_updates add column if not exists created_at timestamptz not null default now();
alter table public.emergency_updates add column if not exists updated_at timestamptz not null default now();

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  role text,
  contact_type text not null default 'official',
  status text not null default 'active',
  phone text,
  email text,
  website text,
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.emergency_contacts add column if not exists name text;
alter table public.emergency_contacts add column if not exists organization text;
alter table public.emergency_contacts add column if not exists role text;
alter table public.emergency_contacts add column if not exists contact_type text not null default 'official';
alter table public.emergency_contacts add column if not exists status text not null default 'active';
alter table public.emergency_contacts add column if not exists phone text;
alter table public.emergency_contacts add column if not exists email text;
alter table public.emergency_contacts add column if not exists website text;
alter table public.emergency_contacts add column if not exists notes text;
alter table public.emergency_contacts add column if not exists last_verified_at timestamptz;
alter table public.emergency_contacts add column if not exists created_at timestamptz not null default now();
alter table public.emergency_contacts add column if not exists updated_at timestamptz not null default now();

create table if not exists public.emergency_checklist_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  phase text not null default 'prep',
  status text not null default 'todo',
  owner text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.emergency_checklist_items add column if not exists title text;
alter table public.emergency_checklist_items add column if not exists phase text not null default 'prep';
alter table public.emergency_checklist_items add column if not exists status text not null default 'todo';
alter table public.emergency_checklist_items add column if not exists owner text;
alter table public.emergency_checklist_items add column if not exists notes text;
alter table public.emergency_checklist_items add column if not exists completed_at timestamptz;
alter table public.emergency_checklist_items add column if not exists created_at timestamptz not null default now();
alter table public.emergency_checklist_items add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_emergency_updates_status on public.emergency_updates(status);
create index if not exists idx_emergency_updates_severity on public.emergency_updates(severity);
create index if not exists idx_emergency_updates_type on public.emergency_updates(update_type);
create index if not exists idx_emergency_contacts_status on public.emergency_contacts(status);
create index if not exists idx_emergency_checklist_status on public.emergency_checklist_items(status);

insert into public.emergency_updates (title, update_type, severity, status, location, summary, official_source, official_url, instructions, verified_by)
select 'Emergency Desk beta test item', 'community', 'watch', 'draft', 'Haida Gwaii', 'Use this placeholder to test the emergency publishing workflow before public beta.', 'HGN beta desk', null, 'Confirm official source, publish only after verification, then expire the item after the test.', 'HGN team'
where not exists (select 1 from public.emergency_updates where title = 'Emergency Desk beta test item');

insert into public.emergency_contacts (name, organization, role, contact_type, status, website, notes)
select 'Emergency Info BC', 'Province of British Columbia', 'Official emergency information', 'official', 'active', 'https://www.emergencyinfobc.gov.bc.ca/', 'Use as a primary official source link during public safety incidents.'
where not exists (select 1 from public.emergency_contacts where name = 'Emergency Info BC');

insert into public.emergency_checklist_items (title, phase, status, owner, notes)
select 'Confirm emergency page publishing and expiry workflow', 'prep', 'todo', 'HGN team', 'Create a draft update, verify it, publish it publicly, then expire it.'
where not exists (select 1 from public.emergency_checklist_items where title = 'Confirm emergency page publishing and expiry workflow');
