-- HGN v109 - Trim Desk
-- Lightweight cleanup board for a two-person admin/editor beta.

create table if not exists public.trim_desk_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_area text not null default 'admin',
  trim_status text not null default 'open',
  priority text not null default 'normal',
  owner text not null default 'Admin / Editor',
  target_path text,
  notes text,
  sort_order integer not null default 100,
  is_done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trim_desk_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'workflow',
  helper text,
  is_ready boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trim_desk_items_status_idx on public.trim_desk_items(trim_status);
create index if not exists trim_desk_items_priority_idx on public.trim_desk_items(priority);
create index if not exists trim_desk_items_sort_idx on public.trim_desk_items(sort_order);
create index if not exists trim_desk_checks_sort_idx on public.trim_desk_checks(sort_order);

insert into public.trim_desk_items (title, item_area, trim_status, priority, owner, target_path, notes, sort_order)
select 'Hide or ignore desks that are not needed this week', 'admin', 'open', 'high', 'Admin / Editor', '/admin', 'Keep the working surface small while only two people are testing.', 10
where not exists (select 1 from public.trim_desk_items where title = 'Hide or ignore desks that are not needed this week');

insert into public.trim_desk_items (title, item_area, trim_status, priority, owner, target_path, notes, sort_order)
select 'Check the fastest route from draft to publish', 'publishing', 'open', 'normal', 'Admin / Editor', '/admin/fast-publish', 'Make sure the daily path is obvious without opening five dashboards.', 20
where not exists (select 1 from public.trim_desk_items where title = 'Check the fastest route from draft to publish');

insert into public.trim_desk_items (title, item_area, trim_status, priority, owner, target_path, notes, sort_order)
select 'List pages that feel noisy or duplicate', 'ux', 'open', 'normal', 'Admin / Editor', null, 'Use this as a short running list of things to simplify before opening beta wider.', 30
where not exists (select 1 from public.trim_desk_items where title = 'List pages that feel noisy or duplicate');

insert into public.trim_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'Daily admin path is obvious', 'workflow', 'You can start the day from one or two screens, not ten.', false, 10
where not exists (select 1 from public.trim_desk_checks where title = 'Daily admin path is obvious');

insert into public.trim_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'Editor path is simple', 'workflow', 'The editor can find what needs review, polish and publishing without hunting.', false, 20
where not exists (select 1 from public.trim_desk_checks where title = 'Editor path is simple');

insert into public.trim_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'Public pages feel focused', 'reader', 'The reader-facing site should not expose beta clutter or unfinished workflows.', false, 30
where not exists (select 1 from public.trim_desk_checks where title = 'Public pages feel focused');
