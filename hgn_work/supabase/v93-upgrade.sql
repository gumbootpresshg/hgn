-- HGN v93 - Fast Publish
-- Lightweight daily publishing helpers for the two-person admin/editor beta workflow.

create extension if not exists pgcrypto;

create table if not exists public.fast_publish_presets (
  id uuid primary key default gen_random_uuid(),
  preset_key text unique not null,
  preset_label text not null,
  article_type text default 'news',
  default_section text default 'latest',
  default_status text default 'draft',
  checklist text[] default array['headline','image','seo','copy check'],
  is_active boolean default true,
  sort_order integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.fast_publish_queue (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  article_slug text,
  story_title text not null,
  source_preset text,
  queue_status text default 'drafting',
  assigned_to text,
  priority text default 'normal',
  target_publish_at timestamptz,
  started_at timestamptz,
  ready_at timestamptz,
  published_at timestamptz,
  minutes_to_ready integer,
  needs_image boolean default false,
  needs_seo boolean default true,
  needs_copy_check boolean default true,
  needs_homepage_slot boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.fast_publish_actions (
  id uuid primary key default gen_random_uuid(),
  queue_item_id uuid references public.fast_publish_queue(id) on delete cascade,
  action_label text not null,
  action_type text default 'check',
  status text default 'todo',
  owner text,
  priority text default 'normal',
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.fast_publish_notes (
  id uuid primary key default gen_random_uuid(),
  note_label text not null,
  note_body text,
  note_type text default 'handoff',
  status text default 'open',
  owner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fast_publish_queue_status on public.fast_publish_queue(queue_status);
create index if not exists idx_fast_publish_queue_priority on public.fast_publish_queue(priority);
create index if not exists idx_fast_publish_queue_target on public.fast_publish_queue(target_publish_at);
create index if not exists idx_fast_publish_actions_status on public.fast_publish_actions(status);
create index if not exists idx_fast_publish_presets_active on public.fast_publish_presets(is_active);

insert into public.fast_publish_presets (preset_key, preset_label, article_type, default_section, default_status, checklist, sort_order, notes)
values
  ('breaking_update', 'Breaking / urgent update', 'breaking', 'top_stories', 'draft', array['headline','confirm source','timestamp','homepage slot'], 1, 'Use for fast local updates that need clear source and timestamp.'),
  ('daily_story', 'Standard daily story', 'news', 'latest', 'draft', array['headline','copy check','image','seo'], 2, 'The normal publish path for daily HGN stories.'),
  ('photo_brief', 'Photo brief', 'photo', 'community', 'draft', array['caption','credit','alt text','homepage slot'], 3, 'Fast photo-led post with correct credit and alt text.'),
  ('community_notice', 'Community notice', 'notice', 'community_board', 'draft', array['date','location','contact','expiry'], 4, 'Quick community item with expiry and contact details.')
on conflict (preset_key) do update set
  preset_label = excluded.preset_label,
  article_type = excluded.article_type,
  default_section = excluded.default_section,
  checklist = excluded.checklist,
  sort_order = excluded.sort_order,
  notes = excluded.notes,
  updated_at = now();

insert into public.fast_publish_notes (note_label, note_body, note_type, status, owner)
values ('Today''s publish handoff', 'Use this as a simple admin/editor handoff note for what should go live next.', 'handoff', 'open', 'Admin / Editor')
on conflict do nothing;
