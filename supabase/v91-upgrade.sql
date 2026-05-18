-- HGN v91 - Copy Desk Polish
-- Lightweight copy/editing helper for the current two-person beta workflow.
-- Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists copy_desk_items (
  id uuid primary key default gen_random_uuid(),
  article_title text not null,
  article_slug text,
  desk_area text not null default 'copy',
  owner text,
  status text not null default 'needs_review',
  priority text not null default 'normal',
  issue_summary text,
  fix_notes text,
  publish_blocker boolean not null default false,
  homepage_sensitive boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists copy_desk_checklist (
  id uuid primary key default gen_random_uuid(),
  check_label text not null,
  check_group text not null default 'article',
  help_text text,
  sort_order integer not null default 0,
  required_before_publish boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists copy_desk_style_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_type text not null default 'style',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists copy_desk_items_status_idx on copy_desk_items(status);
create index if not exists copy_desk_items_priority_idx on copy_desk_items(priority);
create index if not exists copy_desk_items_blocker_idx on copy_desk_items(publish_blocker);
create index if not exists copy_desk_checklist_active_idx on copy_desk_checklist(active);
create index if not exists copy_desk_style_notes_status_idx on copy_desk_style_notes(status);

insert into copy_desk_checklist (check_label, check_group, help_text, sort_order, required_before_publish)
select 'Headline is clear and local', 'article', 'Avoid vague headlines. Make the local angle obvious.', 10, true
where not exists (select 1 from copy_desk_checklist where check_label = 'Headline is clear and local');

insert into copy_desk_checklist (check_label, check_group, help_text, sort_order, required_before_publish)
select 'Names, places, and spellings checked', 'article', 'Confirm people, communities, organizations, dates, and locations.', 20, true
where not exists (select 1 from copy_desk_checklist where check_label = 'Names, places, and spellings checked');

insert into copy_desk_checklist (check_label, check_group, help_text, sort_order, required_before_publish)
select 'Image credit, caption, and alt text ready', 'media', 'Make sure every public image has the basics before publishing.', 30, true
where not exists (select 1 from copy_desk_checklist where check_label = 'Image credit, caption, and alt text ready');

insert into copy_desk_checklist (check_label, check_group, help_text, sort_order, required_before_publish)
select 'SEO/social excerpt is usable', 'metadata', 'The story should look good when shared and make sense in search.', 40, true
where not exists (select 1 from copy_desk_checklist where check_label = 'SEO/social excerpt is usable');

insert into copy_desk_style_notes (note_title, note_body, note_type, status)
select 'Two-person copy rule', 'Do the important checks only: accuracy, clarity, image metadata, and whether the story is safe to publish.', 'workflow', 'active'
where not exists (select 1 from copy_desk_style_notes where note_title = 'Two-person copy rule');

insert into copy_desk_items (article_title, desk_area, owner, status, priority, issue_summary, publish_blocker, homepage_sensitive)
select 'Run final copy pass on the next homepage story', 'copy', 'HGN team', 'needs_review', 'high', 'Use this as the default final check before a lead story goes live.', true, true
where not exists (select 1 from copy_desk_items where article_title = 'Run final copy pass on the next homepage story');
