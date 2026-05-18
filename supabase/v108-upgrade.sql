-- HGN v108 - Newsflow Board
-- Lightweight two-person admin/editor publishing flow visibility.

create table if not exists public.newsflow_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text not null default 'story',
  flow_status text not null default 'planned',
  priority text not null default 'normal',
  target_slot text,
  article_slug text,
  owner text not null default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  is_done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsflow_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'publishing',
  helper text,
  is_ready boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsflow_items_status_idx on public.newsflow_items(flow_status);
create index if not exists newsflow_items_priority_idx on public.newsflow_items(priority);
create index if not exists newsflow_items_sort_idx on public.newsflow_items(sort_order);
create index if not exists newsflow_checks_sort_idx on public.newsflow_checks(sort_order);

insert into public.newsflow_items (title, item_type, flow_status, priority, target_slot, owner, notes, sort_order)
select 'Pick the next lead story', 'story', 'planned', 'high', 'Homepage lead', 'Admin / Editor', 'Choose the story that should carry the page today.', 10
where not exists (select 1 from public.newsflow_items where title = 'Pick the next lead story');

insert into public.newsflow_items (title, item_type, flow_status, priority, target_slot, owner, notes, sort_order)
select 'Check stale homepage items', 'homepage', 'planned', 'normal', 'Homepage', 'Admin / Editor', 'Look for stories that should be moved down or replaced.', 20
where not exists (select 1 from public.newsflow_items where title = 'Check stale homepage items');

insert into public.newsflow_items (title, item_type, flow_status, priority, target_slot, owner, notes, sort_order)
select 'Confirm any live update needs', 'live', 'waiting', 'normal', 'Live updates', 'Admin / Editor', 'Use only when there is an active local update or urgent notice.', 30
where not exists (select 1 from public.newsflow_items where title = 'Confirm any live update needs');

insert into public.newsflow_checks (title, check_area, helper, is_ready, sort_order)
select 'Lead story is clear', 'homepage', 'The top story for the day is obvious to both admin and editor.', false, 10
where not exists (select 1 from public.newsflow_checks where title = 'Lead story is clear');

insert into public.newsflow_checks (title, check_area, helper, is_ready, sort_order)
select 'Ready stories have images', 'media', 'Featured stories should have a usable image, credit, caption and alt text.', false, 20
where not exists (select 1 from public.newsflow_checks where title = 'Ready stories have images');

insert into public.newsflow_checks (title, check_area, helper, is_ready, sort_order)
select 'Homepage rhythm feels fresh', 'homepage', 'The page should not feel stale when a reader checks it today.', false, 30
where not exists (select 1 from public.newsflow_checks where title = 'Homepage rhythm feels fresh');
