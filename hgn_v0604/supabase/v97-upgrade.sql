-- HGN v97 - Storyboard
-- Lightweight story planning for a two-person admin/editor newsroom.

create table if not exists public.newsroom_storyboard_items (
  id uuid primary key default gen_random_uuid(),
  story_title text not null,
  story_slug text,
  story_type text not null default 'article',
  workflow_state text not null default 'idea',
  priority_level text not null default 'normal',
  assigned_to text not null default 'Admin / Editor',
  needs_photo boolean not null default false,
  needs_source_check boolean not null default false,
  target_window text,
  homepage_slot text,
  notes text,
  sort_order integer not null default 100,
  planned_for date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsroom_storyboard_items add column if not exists story_title text;
alter table public.newsroom_storyboard_items add column if not exists story_slug text;
alter table public.newsroom_storyboard_items add column if not exists story_type text not null default 'article';
alter table public.newsroom_storyboard_items add column if not exists workflow_state text not null default 'idea';
alter table public.newsroom_storyboard_items add column if not exists priority_level text not null default 'normal';
alter table public.newsroom_storyboard_items add column if not exists assigned_to text not null default 'Admin / Editor';
alter table public.newsroom_storyboard_items add column if not exists needs_photo boolean not null default false;
alter table public.newsroom_storyboard_items add column if not exists needs_source_check boolean not null default false;
alter table public.newsroom_storyboard_items add column if not exists target_window text;
alter table public.newsroom_storyboard_items add column if not exists homepage_slot text;
alter table public.newsroom_storyboard_items add column if not exists notes text;
alter table public.newsroom_storyboard_items add column if not exists sort_order integer not null default 100;
alter table public.newsroom_storyboard_items add column if not exists planned_for date;
alter table public.newsroom_storyboard_items add column if not exists published_at timestamptz;
alter table public.newsroom_storyboard_items add column if not exists created_at timestamptz not null default now();
alter table public.newsroom_storyboard_items add column if not exists updated_at timestamptz not null default now();

create table if not exists public.newsroom_storyboard_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_type text not null default 'planning',
  status text not null default 'open',
  owner text not null default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsroom_storyboard_notes add column if not exists note_title text;
alter table public.newsroom_storyboard_notes add column if not exists note_body text;
alter table public.newsroom_storyboard_notes add column if not exists note_type text not null default 'planning';
alter table public.newsroom_storyboard_notes add column if not exists status text not null default 'open';
alter table public.newsroom_storyboard_notes add column if not exists owner text not null default 'Admin / Editor';
alter table public.newsroom_storyboard_notes add column if not exists created_at timestamptz not null default now();
alter table public.newsroom_storyboard_notes add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_storyboard_items_state on public.newsroom_storyboard_items(workflow_state);
create index if not exists idx_storyboard_items_sort on public.newsroom_storyboard_items(sort_order asc, updated_at desc);
create index if not exists idx_storyboard_items_planned_for on public.newsroom_storyboard_items(planned_for desc);
create index if not exists idx_storyboard_notes_status on public.newsroom_storyboard_notes(status);

insert into public.newsroom_storyboard_items (story_title, story_type, workflow_state, priority_level, assigned_to, needs_photo, needs_source_check, target_window, homepage_slot, notes, sort_order)
select 'Pick tomorrow''s lead story', 'planning', 'ready', 'high', 'Admin / Editor', false, false, 'Tomorrow morning', 'Hero', 'Use this as the simple daily story-planning anchor.', 1
where not exists (select 1 from public.newsroom_storyboard_items where story_title = 'Pick tomorrow''s lead story');

insert into public.newsroom_storyboard_items (story_title, story_type, workflow_state, priority_level, assigned_to, needs_photo, needs_source_check, target_window, homepage_slot, notes, sort_order)
select 'Check which story still needs a photo', 'photo', 'waiting', 'normal', 'Admin / Editor', true, false, 'Before publish', 'Latest', 'Keeps the two-person workflow focused on what blocks publishing.', 2
where not exists (select 1 from public.newsroom_storyboard_items where story_title = 'Check which story still needs a photo');

insert into public.newsroom_storyboard_notes (note_title, note_body, note_type, status, owner)
select 'Storyboard rule', 'Keep this board small. It should show what is next, what is waiting and what is blocked.', 'workflow', 'open', 'Admin / Editor'
where not exists (select 1 from public.newsroom_storyboard_notes where note_title = 'Storyboard rule');
