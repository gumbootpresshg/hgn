-- HGN v103 - Edit Queue Lite
-- Lightweight two-person edit queue for admin/editor beta workflow.

create table if not exists edit_queue_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  story_slug text,
  queue_stage text not null default 'needs_edit',
  priority text not null default 'normal',
  owner text not null default 'Admin / Editor',
  due_label text,
  headline_done boolean not null default false,
  body_done boolean not null default false,
  image_done boolean not null default false,
  seo_done boolean not null default false,
  homepage_done boolean not null default false,
  notes text,
  sort_order integer not null default 100,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists edit_queue_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_type text not null default 'handoff',
  status text not null default 'open',
  owner text not null default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists edit_queue_items_stage_idx on edit_queue_items(queue_stage);
create index if not exists edit_queue_items_priority_idx on edit_queue_items(priority);
create index if not exists edit_queue_items_sort_idx on edit_queue_items(sort_order, created_at);
create index if not exists edit_queue_notes_status_idx on edit_queue_notes(status);

insert into edit_queue_items (title, queue_stage, priority, owner, due_label, notes, sort_order)
values
  ('Lead story final read', 'needs_edit', 'high', 'Editor', 'Today', 'Final copy pass before publishing.', 10),
  ('Homepage headline check', 'needs_review', 'normal', 'Admin / Editor', 'Today', 'Make sure the homepage title and deck match the story.', 20),
  ('Image credit and alt text sweep', 'needs_media', 'normal', 'Admin', 'Before publish', 'Check photo credit, caption, alt text and mobile crop.', 30)
on conflict do nothing;

insert into edit_queue_notes (note_title, note_body, note_type, status, owner)
values
  ('Today''s edit handoff', 'Use this as the simple admin/editor note for what needs final attention before going live.', 'handoff', 'open', 'Admin / Editor')
on conflict do nothing;
