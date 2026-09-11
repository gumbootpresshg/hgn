-- HGN v96 - Two-Person Handoff
-- Lightweight admin/editor handoff and daily decision tracking.

create table if not exists public.newsroom_handoff_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  handoff_type text not null default 'daily',
  status text not null default 'open',
  owner text not null default 'Admin / Editor',
  needs_reply boolean not null default false,
  due_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsroom_handoff_notes add column if not exists note_title text;
alter table public.newsroom_handoff_notes add column if not exists note_body text;
alter table public.newsroom_handoff_notes add column if not exists handoff_type text not null default 'daily';
alter table public.newsroom_handoff_notes add column if not exists status text not null default 'open';
alter table public.newsroom_handoff_notes add column if not exists owner text not null default 'Admin / Editor';
alter table public.newsroom_handoff_notes add column if not exists needs_reply boolean not null default false;
alter table public.newsroom_handoff_notes add column if not exists due_at timestamptz;
alter table public.newsroom_handoff_notes add column if not exists resolved_at timestamptz;
alter table public.newsroom_handoff_notes add column if not exists created_at timestamptz not null default now();
alter table public.newsroom_handoff_notes add column if not exists updated_at timestamptz not null default now();

create table if not exists public.newsroom_daily_priorities (
  id uuid primary key default gen_random_uuid(),
  priority_label text not null,
  priority_type text not null default 'story',
  status text not null default 'planned',
  rank integer not null default 10,
  owner text not null default 'Admin / Editor',
  target_slot text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsroom_daily_priorities add column if not exists priority_label text;
alter table public.newsroom_daily_priorities add column if not exists priority_type text not null default 'story';
alter table public.newsroom_daily_priorities add column if not exists status text not null default 'planned';
alter table public.newsroom_daily_priorities add column if not exists rank integer not null default 10;
alter table public.newsroom_daily_priorities add column if not exists owner text not null default 'Admin / Editor';
alter table public.newsroom_daily_priorities add column if not exists target_slot text;
alter table public.newsroom_daily_priorities add column if not exists notes text;
alter table public.newsroom_daily_priorities add column if not exists completed_at timestamptz;
alter table public.newsroom_daily_priorities add column if not exists created_at timestamptz not null default now();
alter table public.newsroom_daily_priorities add column if not exists updated_at timestamptz not null default now();

create table if not exists public.newsroom_decision_log (
  id uuid primary key default gen_random_uuid(),
  decision_title text not null,
  decision_body text,
  decision_area text not null default 'publishing',
  decided_by text not null default 'Admin / Editor',
  status text not null default 'active',
  revisit_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsroom_decision_log add column if not exists decision_title text;
alter table public.newsroom_decision_log add column if not exists decision_body text;
alter table public.newsroom_decision_log add column if not exists decision_area text not null default 'publishing';
alter table public.newsroom_decision_log add column if not exists decided_by text not null default 'Admin / Editor';
alter table public.newsroom_decision_log add column if not exists status text not null default 'active';
alter table public.newsroom_decision_log add column if not exists revisit_on date;
alter table public.newsroom_decision_log add column if not exists created_at timestamptz not null default now();
alter table public.newsroom_decision_log add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_newsroom_handoff_status on public.newsroom_handoff_notes(status);
create index if not exists idx_newsroom_handoff_updated on public.newsroom_handoff_notes(updated_at desc);
create index if not exists idx_newsroom_daily_priorities_status on public.newsroom_daily_priorities(status);
create index if not exists idx_newsroom_daily_priorities_rank on public.newsroom_daily_priorities(rank asc, updated_at desc);
create index if not exists idx_newsroom_decision_log_status on public.newsroom_decision_log(status);

insert into public.newsroom_handoff_notes (note_title, note_body, handoff_type, status, owner, needs_reply)
select 'Today''s handoff', 'Use this for the one thing the other person needs to know before publishing or changing the homepage.', 'daily', 'open', 'Admin / Editor', true
where not exists (select 1 from public.newsroom_handoff_notes where note_title = 'Today''s handoff');

insert into public.newsroom_daily_priorities (priority_label, priority_type, status, rank, owner, target_slot, notes)
select 'Pick the lead story for today', 'homepage', 'planned', 1, 'Admin / Editor', 'Hero', 'Keep this as the daily homepage decision until the site is live and stable.'
where not exists (select 1 from public.newsroom_daily_priorities where priority_label = 'Pick the lead story for today');

insert into public.newsroom_decision_log (decision_title, decision_body, decision_area, decided_by, status)
select 'Keep beta testing to the two-person HGN team', 'Treat this phase as admin/editor workflow testing, not broad public beta testing.', 'beta', 'Admin / Editor', 'active'
where not exists (select 1 from public.newsroom_decision_log where decision_title = 'Keep beta testing to the two-person HGN team');
