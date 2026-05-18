-- HGN v95 - Live Desk
-- Lightweight breaking-news and rolling update workflow for the two-person admin/editor beta.

create extension if not exists pgcrypto;

create table if not exists public.live_desk_stories (
  id uuid primary key default gen_random_uuid(),
  story_title text not null,
  story_slug text,
  status text default 'watching',
  priority text default 'normal',
  pinned boolean default false,
  banner_text text,
  owner text default 'Admin / Editor',
  notes text,
  started_at timestamptz default now(),
  closed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.live_desk_updates (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.live_desk_stories(id) on delete cascade,
  update_title text not null,
  update_body text,
  status text default 'draft',
  source_note text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.live_desk_tasks (
  id uuid primary key default gen_random_uuid(),
  task_label text not null,
  task_type text default 'live_check',
  status text default 'todo',
  priority text default 'normal',
  owner text default 'Admin / Editor',
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_live_desk_stories_status on public.live_desk_stories(status);
create index if not exists idx_live_desk_stories_pinned on public.live_desk_stories(pinned);
create index if not exists idx_live_desk_updates_story on public.live_desk_updates(story_id);
create index if not exists idx_live_desk_updates_status on public.live_desk_updates(status);
create index if not exists idx_live_desk_tasks_status on public.live_desk_tasks(status);

insert into public.live_desk_tasks (task_label, task_type, status, priority, owner, notes)
values
  ('Confirm the source before publishing a live update', 'verification', 'todo', 'high', 'Admin / Editor', 'Use this as the basic check before urgent updates go public.'),
  ('Check whether a homepage banner is needed', 'homepage_banner', 'todo', 'normal', 'Admin / Editor', 'Only use banners for urgent, current, locally useful information.')
on conflict do nothing;
