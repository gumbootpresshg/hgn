-- HGN v90 - Newsroom Streamline
-- Two-person beta workflow for the HGN team: admin + editor.
-- Safe to run more than once.

create extension if not exists pgcrypto;

alter table if exists daily_operator_runs
  add column if not exists operator_on_duty text,
  add column if not exists newsroom_note text,
  add column if not exists current_priority text,
  add column if not exists updated_at timestamptz default now();

update daily_operator_runs
set operator_on_duty = coalesce(operator_on_duty, founder_on_duty)
where operator_on_duty is null and exists (
  select 1 from information_schema.columns
  where table_name = 'daily_operator_runs' and column_name = 'founder_on_duty'
);

create table if not exists newsroom_queue_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  article_slug text,
  queue_area text not null default 'publishing',
  owner text,
  status text not null default 'needs_attention',
  priority text not null default 'normal',
  next_step text,
  homepage_candidate boolean not null default false,
  publish_today boolean not null default false,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists newsroom_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_type text not null default 'sticky',
  owner text,
  status text not null default 'open',
  pinned boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists newsroom_homepage_controls (
  id uuid primary key default gen_random_uuid(),
  slot_name text not null,
  story_title text,
  article_slug text,
  slot_order integer not null default 0,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsroom_queue_status_idx on newsroom_queue_items(status);
create index if not exists newsroom_queue_priority_idx on newsroom_queue_items(priority);
create index if not exists newsroom_queue_publish_today_idx on newsroom_queue_items(publish_today);
create index if not exists newsroom_notes_pinned_idx on newsroom_notes(pinned);
create index if not exists newsroom_homepage_order_idx on newsroom_homepage_controls(slot_order);

insert into newsroom_queue_items (title, queue_area, owner, status, priority, next_step, homepage_candidate, publish_today)
select 'Choose today''s lead story', 'homepage', 'HGN team', 'needs_attention', 'high', 'Pick the top story and make sure the homepage reflects it.', true, true
where not exists (select 1 from newsroom_queue_items where title = 'Choose today''s lead story');

insert into newsroom_queue_items (title, queue_area, owner, status, priority, next_step, homepage_candidate, publish_today)
select 'Check article images, captions, credits, and alt text', 'publishing', 'HGN team', 'needs_attention', 'high', 'Do this before publishing or sharing.', false, true
where not exists (select 1 from newsroom_queue_items where title = 'Check article images, captions, credits, and alt text');

insert into newsroom_notes (note_title, note_body, note_type, owner, status, pinned)
select 'Two-person beta rule', 'Keep the workflow simple: one clear priority, one current homepage, and no unnecessary admin work.', 'sticky', 'HGN team', 'open', true
where not exists (select 1 from newsroom_notes where note_title = 'Two-person beta rule');

insert into newsroom_homepage_controls (slot_name, story_title, slot_order, status, notes)
select 'Lead story', null, 1, 'planned', 'Main story visitors should see first.'
where not exists (select 1 from newsroom_homepage_controls where slot_name = 'Lead story');

insert into newsroom_homepage_controls (slot_name, story_title, slot_order, status, notes)
select 'Useful local update', null, 2, 'planned', 'Weather, ferry, emergency, events, or community service item.'
where not exists (select 1 from newsroom_homepage_controls where slot_name = 'Useful local update');
