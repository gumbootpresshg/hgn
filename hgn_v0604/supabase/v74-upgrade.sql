-- HGN v74 - Community Source Desk
-- Defensive beta migration: safe to run after earlier upgrade attempts.

create extension if not exists pgcrypto;

create table if not exists public.source_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null default 'community',
  beat text not null default 'general',
  status text not null default 'new',
  contact_method text default 'email',
  email text,
  phone text,
  organization text,
  consent_notes text,
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.source_contacts add column if not exists name text;
alter table public.source_contacts add column if not exists source_type text not null default 'community';
alter table public.source_contacts add column if not exists beat text not null default 'general';
alter table public.source_contacts add column if not exists status text not null default 'new';
alter table public.source_contacts add column if not exists contact_method text default 'email';
alter table public.source_contacts add column if not exists email text;
alter table public.source_contacts add column if not exists phone text;
alter table public.source_contacts add column if not exists organization text;
alter table public.source_contacts add column if not exists consent_notes text;
alter table public.source_contacts add column if not exists notes text;
alter table public.source_contacts add column if not exists last_contacted_at timestamptz;
alter table public.source_contacts add column if not exists created_at timestamptz not null default now();
alter table public.source_contacts add column if not exists updated_at timestamptz not null default now();

create table if not exists public.source_story_pitches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  beat text not null default 'general',
  status text not null default 'new',
  priority text not null default 'normal',
  source_contact_id uuid references public.source_contacts(id) on delete set null,
  source_name text,
  summary text,
  next_step text,
  owner text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.source_story_pitches add column if not exists title text;
alter table public.source_story_pitches add column if not exists beat text not null default 'general';
alter table public.source_story_pitches add column if not exists status text not null default 'new';
alter table public.source_story_pitches add column if not exists priority text not null default 'normal';
alter table public.source_story_pitches add column if not exists source_contact_id uuid references public.source_contacts(id) on delete set null;
alter table public.source_story_pitches add column if not exists source_name text;
alter table public.source_story_pitches add column if not exists summary text;
alter table public.source_story_pitches add column if not exists next_step text;
alter table public.source_story_pitches add column if not exists owner text;
alter table public.source_story_pitches add column if not exists due_at timestamptz;
alter table public.source_story_pitches add column if not exists created_at timestamptz not null default now();
alter table public.source_story_pitches add column if not exists updated_at timestamptz not null default now();

create table if not exists public.source_followups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'pending',
  source_contact_id uuid references public.source_contacts(id) on delete set null,
  pitch_id uuid references public.source_story_pitches(id) on delete cascade,
  owner text,
  notes text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.source_followups add column if not exists title text;
alter table public.source_followups add column if not exists status text not null default 'pending';
alter table public.source_followups add column if not exists source_contact_id uuid references public.source_contacts(id) on delete set null;
alter table public.source_followups add column if not exists pitch_id uuid references public.source_story_pitches(id) on delete cascade;
alter table public.source_followups add column if not exists owner text;
alter table public.source_followups add column if not exists notes text;
alter table public.source_followups add column if not exists due_at timestamptz;
alter table public.source_followups add column if not exists completed_at timestamptz;
alter table public.source_followups add column if not exists created_at timestamptz not null default now();
alter table public.source_followups add column if not exists updated_at timestamptz not null default now();

create table if not exists public.source_verification_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_type text not null default 'identity',
  status text not null default 'pending',
  source_contact_id uuid references public.source_contacts(id) on delete set null,
  pitch_id uuid references public.source_story_pitches(id) on delete cascade,
  owner text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.source_verification_checks add column if not exists title text;
alter table public.source_verification_checks add column if not exists check_type text not null default 'identity';
alter table public.source_verification_checks add column if not exists status text not null default 'pending';
alter table public.source_verification_checks add column if not exists source_contact_id uuid references public.source_contacts(id) on delete set null;
alter table public.source_verification_checks add column if not exists pitch_id uuid references public.source_story_pitches(id) on delete cascade;
alter table public.source_verification_checks add column if not exists owner text;
alter table public.source_verification_checks add column if not exists notes text;
alter table public.source_verification_checks add column if not exists created_at timestamptz not null default now();
alter table public.source_verification_checks add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_source_contacts_status on public.source_contacts(status);
create index if not exists idx_source_contacts_beat on public.source_contacts(beat);
create index if not exists idx_source_story_pitches_status on public.source_story_pitches(status);
create index if not exists idx_source_story_pitches_priority on public.source_story_pitches(priority);
create index if not exists idx_source_followups_status on public.source_followups(status);
create index if not exists idx_source_verification_checks_status on public.source_verification_checks(status);

insert into public.source_contacts (name, source_type, beat, status, contact_method, organization, notes)
select 'HGN community source placeholder', 'community', 'general', 'new', 'email', 'HGN beta', 'Replace this seed with real trusted community contacts during beta onboarding.'
where not exists (select 1 from public.source_contacts where name = 'HGN community source placeholder');

insert into public.source_story_pitches (title, beat, status, priority, source_name, summary, next_step, owner)
select 'Build first trusted source list for beta launch', 'newsroom', 'new', 'high', 'HGN team', 'Create a reliable starter list of people and organizations HGN can contact for verification and community updates.', 'Add 10 verified contacts before public beta.', 'HGN team'
where not exists (select 1 from public.source_story_pitches where title = 'Build first trusted source list for beta launch');

insert into public.source_verification_checks (title, check_type, status, owner, notes)
select 'Confirm correction and source verification workflow', 'fact', 'pending', 'HGN team', 'Run one test story lead through source contact, verification, preflight and trust/corrections flow.'
where not exists (select 1 from public.source_verification_checks where title = 'Confirm correction and source verification workflow');
