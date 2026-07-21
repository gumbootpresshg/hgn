-- HGN v98 - Publish Brief
-- Lightweight daily publishing plan for a two-person admin/editor beta workflow.

create table if not exists public.daily_publish_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_date date not null default current_date,
  lead_story text,
  editor_focus text,
  admin_focus text,
  homepage_plan text,
  notes text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_publish_briefs add column if not exists brief_date date not null default current_date;
alter table public.daily_publish_briefs add column if not exists lead_story text;
alter table public.daily_publish_briefs add column if not exists editor_focus text;
alter table public.daily_publish_briefs add column if not exists admin_focus text;
alter table public.daily_publish_briefs add column if not exists homepage_plan text;
alter table public.daily_publish_briefs add column if not exists notes text;
alter table public.daily_publish_briefs add column if not exists status text not null default 'open';
alter table public.daily_publish_briefs add column if not exists created_at timestamptz not null default now();
alter table public.daily_publish_briefs add column if not exists updated_at timestamptz not null default now();

create table if not exists public.daily_publish_brief_items (
  id uuid primary key default gen_random_uuid(),
  task_title text not null,
  task_type text not null default 'publish',
  status text not null default 'open',
  owner text not null default 'Admin / Editor',
  related_story text,
  is_blocking boolean not null default false,
  sort_order integer not null default 100,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_publish_brief_items add column if not exists task_title text;
alter table public.daily_publish_brief_items add column if not exists task_type text not null default 'publish';
alter table public.daily_publish_brief_items add column if not exists status text not null default 'open';
alter table public.daily_publish_brief_items add column if not exists owner text not null default 'Admin / Editor';
alter table public.daily_publish_brief_items add column if not exists related_story text;
alter table public.daily_publish_brief_items add column if not exists is_blocking boolean not null default false;
alter table public.daily_publish_brief_items add column if not exists sort_order integer not null default 100;
alter table public.daily_publish_brief_items add column if not exists notes text;
alter table public.daily_publish_brief_items add column if not exists completed_at timestamptz;
alter table public.daily_publish_brief_items add column if not exists created_at timestamptz not null default now();
alter table public.daily_publish_brief_items add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_daily_publish_briefs_date on public.daily_publish_briefs(brief_date desc);
create index if not exists idx_daily_publish_brief_items_status on public.daily_publish_brief_items(status);
create index if not exists idx_daily_publish_brief_items_sort on public.daily_publish_brief_items(sort_order asc, updated_at desc);

insert into public.daily_publish_briefs (brief_date, lead_story, editor_focus, admin_focus, homepage_plan, notes, status)
select current_date, 'Choose today''s lead story', 'Final edit and headline polish', 'Homepage, image and publish checks', 'Hero story plus one fresh community item', 'Keep the daily brief small enough to understand in under a minute.', 'open'
where not exists (select 1 from public.daily_publish_briefs where brief_date = current_date and lead_story = 'Choose today''s lead story');

insert into public.daily_publish_brief_items (task_title, task_type, status, owner, related_story, is_blocking, sort_order, notes)
select 'Confirm the story that goes live first', 'publish', 'ready', 'Admin / Editor', 'Daily lead story', false, 1, 'This is the daily anchor for the two-person workflow.'
where not exists (select 1 from public.daily_publish_brief_items where task_title = 'Confirm the story that goes live first');

insert into public.daily_publish_brief_items (task_title, task_type, status, owner, related_story, is_blocking, sort_order, notes)
select 'Check photo credit, caption and alt text', 'photo', 'waiting', 'Admin / Editor', 'Next publish item', true, 2, 'Do this before publishing or pinning to the homepage.'
where not exists (select 1 from public.daily_publish_brief_items where task_title = 'Check photo credit, caption and alt text');
