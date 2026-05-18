-- HGN v112 - Wrap Desk
-- End-of-day workflow for the two-person admin/editor beta.

create extension if not exists pgcrypto;

create table if not exists wrap_desk_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lane text not null default 'wrap',
  item_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table wrap_desk_items add column if not exists title text;
alter table wrap_desk_items add column if not exists lane text not null default 'wrap';
alter table wrap_desk_items add column if not exists item_status text not null default 'open';
alter table wrap_desk_items add column if not exists owner text not null default 'Admin / Editor';
alter table wrap_desk_items add column if not exists notes text;
alter table wrap_desk_items add column if not exists sort_order integer not null default 100;
alter table wrap_desk_items add column if not exists created_at timestamptz not null default now();
alter table wrap_desk_items add column if not exists updated_at timestamptz not null default now();

create index if not exists wrap_desk_items_status_idx on wrap_desk_items (item_status);
create index if not exists wrap_desk_items_lane_idx on wrap_desk_items (lane);
create index if not exists wrap_desk_items_sort_idx on wrap_desk_items (sort_order);

create table if not exists wrap_desk_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'wrap',
  helper text,
  is_ready boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table wrap_desk_checks add column if not exists title text;
alter table wrap_desk_checks add column if not exists check_area text not null default 'wrap';
alter table wrap_desk_checks add column if not exists helper text;
alter table wrap_desk_checks add column if not exists is_ready boolean not null default false;
alter table wrap_desk_checks add column if not exists sort_order integer not null default 100;
alter table wrap_desk_checks add column if not exists created_at timestamptz not null default now();
alter table wrap_desk_checks add column if not exists updated_at timestamptz not null default now();

create index if not exists wrap_desk_checks_area_idx on wrap_desk_checks (check_area);
create index if not exists wrap_desk_checks_ready_idx on wrap_desk_checks (is_ready);

insert into wrap_desk_items (title, lane, item_status, owner, notes, sort_order)
select 'Mark what actually shipped today', 'published', 'open', 'Admin / Editor', 'Capture the stories, updates or homepage changes that went live so the day has a clean record.', 10
where not exists (select 1 from wrap_desk_items where title = 'Mark what actually shipped today');

insert into wrap_desk_items (title, lane, item_status, owner, notes, sort_order)
select 'Name anything that should carry forward', 'tomorrow', 'carry_forward', 'Admin / Editor', 'Do not leave tomorrow dependent on memory. Put unfinished but still-important items here.', 20
where not exists (select 1 from wrap_desk_items where title = 'Name anything that should carry forward');

insert into wrap_desk_items (title, lane, item_status, owner, notes, sort_order)
select 'Check homepage before closing the day', 'homepage', 'open', 'Admin / Editor', 'Make sure the homepage will not feel stale overnight or first thing in the morning.', 30
where not exists (select 1 from wrap_desk_items where title = 'Check homepage before closing the day');

insert into wrap_desk_items (title, lane, item_status, owner, notes, sort_order)
select 'Leave one short handoff note', 'handoff', 'open', 'Admin / Editor', 'One short note is enough: what matters next, what is blocked and what should not be forgotten.', 40
where not exists (select 1 from wrap_desk_items where title = 'Leave one short handoff note');

insert into wrap_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'Published work is noted', 'published', 'Today has a simple record of what went live.', false, 10
where not exists (select 1 from wrap_desk_checks where title = 'Published work is noted');

insert into wrap_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'Tomorrow has a clear starting point', 'tomorrow', 'Carry-forward items are named instead of being kept in someone''s head.', false, 20
where not exists (select 1 from wrap_desk_checks where title = 'Tomorrow has a clear starting point');

insert into wrap_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'Homepage can sit overnight', 'homepage', 'The homepage lead, utilities and latest items will still make sense until the next update.', false, 30
where not exists (select 1 from wrap_desk_checks where title = 'Homepage can sit overnight');
