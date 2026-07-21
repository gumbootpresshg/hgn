-- HGN v101 - Today Board
-- Lightweight two-person admin/editor workflow for the current day.

create table if not exists public.today_board_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text not null default 'story',
  priority text not null default 'normal',
  status text not null default 'open',
  owner text not null default 'Admin / Editor',
  target_time text,
  notes text,
  sort_order integer not null default 100,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.today_board_items add column if not exists title text;
alter table public.today_board_items add column if not exists item_type text not null default 'story';
alter table public.today_board_items add column if not exists priority text not null default 'normal';
alter table public.today_board_items add column if not exists status text not null default 'open';
alter table public.today_board_items add column if not exists owner text not null default 'Admin / Editor';
alter table public.today_board_items add column if not exists target_time text;
alter table public.today_board_items add column if not exists notes text;
alter table public.today_board_items add column if not exists sort_order integer not null default 100;
alter table public.today_board_items add column if not exists completed_at timestamptz;
alter table public.today_board_items add column if not exists created_at timestamptz not null default now();
alter table public.today_board_items add column if not exists updated_at timestamptz not null default now();

create index if not exists today_board_items_status_idx on public.today_board_items(status);
create index if not exists today_board_items_priority_idx on public.today_board_items(priority);
create index if not exists today_board_items_sort_order_idx on public.today_board_items(sort_order);

insert into public.today_board_items (title, item_type, priority, status, owner, target_time, notes, sort_order)
select 'Pick the lead story', 'lead', 'high', 'open', 'Admin / Editor', 'Morning', 'Choose the main story that should drive the homepage today.', 10
where not exists (select 1 from public.today_board_items where title = 'Pick the lead story');

insert into public.today_board_items (title, item_type, priority, status, owner, target_time, notes, sort_order)
select 'Confirm homepage focus', 'homepage', 'high', 'open', 'Admin / Editor', 'Before publish', 'Check hero, top slots, stale stories and mobile order.', 20
where not exists (select 1 from public.today_board_items where title = 'Confirm homepage focus');

insert into public.today_board_items (title, item_type, priority, status, owner, target_time, notes, sort_order)
select 'Final publish sweep', 'story', 'normal', 'open', 'Admin / Editor', 'Before publish', 'Run the short checklist for slug, SEO, photo credit, caption and alt text.', 30
where not exists (select 1 from public.today_board_items where title = 'Final publish sweep');

insert into public.today_board_items (title, item_type, priority, status, owner, target_time, notes, sort_order)
select 'Leave tomorrow handoff', 'handoff', 'normal', 'open', 'Admin / Editor', 'End of day', 'Write one short note so tomorrow starts clean.', 40
where not exists (select 1 from public.today_board_items where title = 'Leave tomorrow handoff');
