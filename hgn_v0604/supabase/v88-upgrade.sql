-- HGN v88 - Editor Workbench / two-person beta workflow
-- Focus: founder + editor operational speed, homepage curation, draft recovery.

create table if not exists public.editor_workbench_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text not null default 'article',
  status text not null default 'draft',
  priority text not null default 'normal',
  owner text,
  article_slug text,
  checklist text,
  next_step text,
  publish_target timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editor_workbench_notes (
  id uuid primary key default gen_random_uuid(),
  note text not null,
  note_type text not null default 'editorial',
  status text not null default 'open',
  owner text,
  article_slug text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_slots (
  id uuid primary key default gen_random_uuid(),
  slot_name text not null,
  slot_order integer not null default 0,
  article_title text,
  article_slug text,
  status text not null default 'planned',
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.draft_recovery_snapshots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  article_slug text,
  snapshot_body text,
  saved_by text,
  recovery_status text not null default 'saved',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.editor_workbench_items add column if not exists priority text not null default 'normal';
alter table public.editor_workbench_items add column if not exists completed_at timestamptz;
alter table public.editor_workbench_notes add column if not exists completed_at timestamptz;
alter table public.homepage_slots add column if not exists completed_at timestamptz;
alter table public.draft_recovery_snapshots add column if not exists completed_at timestamptz;

create index if not exists editor_workbench_items_status_idx on public.editor_workbench_items(status);
create index if not exists editor_workbench_items_priority_idx on public.editor_workbench_items(priority);
create index if not exists editor_workbench_items_publish_target_idx on public.editor_workbench_items(publish_target);
create index if not exists editor_workbench_notes_status_idx on public.editor_workbench_notes(status);
create index if not exists homepage_slots_order_idx on public.homepage_slots(slot_order);
create index if not exists homepage_slots_status_idx on public.homepage_slots(status);
create index if not exists draft_recovery_snapshots_slug_idx on public.draft_recovery_snapshots(article_slug);

insert into public.editor_workbench_items (title, item_type, status, priority, owner, checklist, next_step)
select 'Daily publishing lane check', 'workflow', 'needs_edit', 'high', 'Founder + Editor', 'Confirm lead story, image, SEO, homepage slot, newsletter/social note.', 'Pick the next article that can ship today.'
where not exists (select 1 from public.editor_workbench_items where title = 'Daily publishing lane check');

insert into public.homepage_slots (slot_name, slot_order, status, notes)
select 'Lead story', 1, 'planned', 'Main story for the digital front page.'
where not exists (select 1 from public.homepage_slots where slot_name = 'Lead story');

insert into public.homepage_slots (slot_name, slot_order, status, notes)
select 'Community utility slot', 2, 'planned', 'Weather, ferry, emergency, notice, or event item that makes the homepage useful today.'
where not exists (select 1 from public.homepage_slots where slot_name = 'Community utility slot');

insert into public.editor_workbench_notes (note, note_type, status, owner)
select 'Keep beta testing focused on the two real users right now: founder and editor. Prioritize faster publishing, less admin clutter, and homepage quality.', 'strategy', 'open', 'Founder'
where not exists (select 1 from public.editor_workbench_notes where note like 'Keep beta testing focused on the two real users%');
