-- HGN v113 - Focus Board
-- Lightweight daily focus workflow for the two-person admin/editor beta.

create extension if not exists pgcrypto;

create table if not exists focus_board_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  focus_area text not null default 'publishing',
  item_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  priority integer not null default 3,
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table focus_board_items add column if not exists title text;
alter table focus_board_items add column if not exists focus_area text not null default 'publishing';
alter table focus_board_items add column if not exists item_status text not null default 'open';
alter table focus_board_items add column if not exists owner text not null default 'Admin / Editor';
alter table focus_board_items add column if not exists priority integer not null default 3;
alter table focus_board_items add column if not exists notes text;
alter table focus_board_items add column if not exists sort_order integer not null default 100;
alter table focus_board_items add column if not exists created_at timestamptz not null default now();
alter table focus_board_items add column if not exists updated_at timestamptz not null default now();

create index if not exists focus_board_items_status_idx on focus_board_items (item_status);
create index if not exists focus_board_items_area_idx on focus_board_items (focus_area);
create index if not exists focus_board_items_priority_idx on focus_board_items (priority);
create index if not exists focus_board_items_sort_idx on focus_board_items (sort_order);

create table if not exists focus_board_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'focus',
  helper text,
  is_ready boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table focus_board_checks add column if not exists title text;
alter table focus_board_checks add column if not exists check_area text not null default 'focus';
alter table focus_board_checks add column if not exists helper text;
alter table focus_board_checks add column if not exists is_ready boolean not null default false;
alter table focus_board_checks add column if not exists sort_order integer not null default 100;
alter table focus_board_checks add column if not exists created_at timestamptz not null default now();
alter table focus_board_checks add column if not exists updated_at timestamptz not null default now();

create index if not exists focus_board_checks_area_idx on focus_board_checks (check_area);
create index if not exists focus_board_checks_ready_idx on focus_board_checks (is_ready);

insert into focus_board_items (title, focus_area, item_status, owner, priority, notes, sort_order)
select 'Pick the main story that matters today', 'lead_story', 'open', 'Admin / Editor', 1, 'Use this to avoid spreading attention across too many desks before the lead item is clear.', 10
where not exists (select 1 from focus_board_items where title = 'Pick the main story that matters today');

insert into focus_board_items (title, focus_area, item_status, owner, priority, notes, sort_order)
select 'Decide what the homepage needs next', 'homepage', 'open', 'Admin / Editor', 1, 'Name the homepage change that would make the site feel freshest today.', 20
where not exists (select 1 from focus_board_items where title = 'Decide what the homepage needs next');

insert into focus_board_items (title, focus_area, item_status, owner, priority, notes, sort_order)
select 'Clear one blocker before adding more work', 'blocker', 'open', 'Admin / Editor', 2, 'Keep the beta lightweight by removing friction before opening another workflow.', 30
where not exists (select 1 from focus_board_items where title = 'Clear one blocker before adding more work');

insert into focus_board_items (title, focus_area, item_status, owner, priority, notes, sort_order)
select 'Leave one short admin/editor note', 'handoff', 'open', 'Admin / Editor', 3, 'One short note is enough: what matters, what is waiting and what should be ignored for now.', 40
where not exists (select 1 from focus_board_items where title = 'Leave one short admin/editor note');

insert into focus_board_checks (title, check_area, helper, is_ready, sort_order)
select 'Top 3 priorities are named', 'focus', 'The day has a small, realistic list instead of a giant admin spread.', false, 10
where not exists (select 1 from focus_board_checks where title = 'Top 3 priorities are named');

insert into focus_board_checks (title, check_area, helper, is_ready, sort_order)
select 'Homepage focus is clear', 'homepage', 'The next homepage move is known before deeper admin work starts.', false, 20
where not exists (select 1 from focus_board_checks where title = 'Homepage focus is clear');

insert into focus_board_checks (title, check_area, helper, is_ready, sort_order)
select 'No unnecessary dashboard hopping', 'workflow', 'Use the focus board to decide where attention goes next.', false, 30
where not exists (select 1 from focus_board_checks where title = 'No unnecessary dashboard hopping');
