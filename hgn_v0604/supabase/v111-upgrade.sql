-- HGN v111 - Morning Desk
-- Lightweight start-of-day workflow for the two-person admin/editor beta.

create extension if not exists pgcrypto;

create table if not exists morning_desk_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lane text not null default 'publishing',
  item_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  target_time text not null default 'morning',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table morning_desk_items add column if not exists title text;
alter table morning_desk_items add column if not exists lane text not null default 'publishing';
alter table morning_desk_items add column if not exists item_status text not null default 'open';
alter table morning_desk_items add column if not exists owner text not null default 'Admin / Editor';
alter table morning_desk_items add column if not exists target_time text not null default 'morning';
alter table morning_desk_items add column if not exists notes text;
alter table morning_desk_items add column if not exists sort_order integer not null default 100;
alter table morning_desk_items add column if not exists created_at timestamptz not null default now();
alter table morning_desk_items add column if not exists updated_at timestamptz not null default now();

create index if not exists morning_desk_items_status_idx on morning_desk_items (item_status);
create index if not exists morning_desk_items_lane_idx on morning_desk_items (lane);
create index if not exists morning_desk_items_sort_idx on morning_desk_items (sort_order);

create table if not exists morning_desk_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'morning',
  helper text,
  is_ready boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table morning_desk_checks add column if not exists title text;
alter table morning_desk_checks add column if not exists check_area text not null default 'morning';
alter table morning_desk_checks add column if not exists helper text;
alter table morning_desk_checks add column if not exists is_ready boolean not null default false;
alter table morning_desk_checks add column if not exists sort_order integer not null default 100;
alter table morning_desk_checks add column if not exists created_at timestamptz not null default now();
alter table morning_desk_checks add column if not exists updated_at timestamptz not null default now();

create index if not exists morning_desk_checks_area_idx on morning_desk_checks (check_area);
create index if not exists morning_desk_checks_ready_idx on morning_desk_checks (is_ready);

insert into morning_desk_items (title, lane, item_status, owner, target_time, notes, sort_order)
select 'Choose the first story or update of the day', 'lead', 'open', 'Admin / Editor', 'morning', 'Start the day by deciding what should anchor the homepage and social/newsletter attention.', 10
where not exists (select 1 from morning_desk_items where title = 'Choose the first story or update of the day');

insert into morning_desk_items (title, lane, item_status, owner, target_time, notes, sort_order)
select 'Check homepage freshness', 'homepage', 'open', 'Admin / Editor', 'morning', 'Make sure the hero, latest stories, utilities and community items do not feel stale.', 20
where not exists (select 1 from morning_desk_items where title = 'Check homepage freshness');

insert into morning_desk_items (title, lane, item_status, owner, target_time, notes, sort_order)
select 'Scan local utility updates', 'utility', 'open', 'Admin / Editor', 'morning', 'Weather, ferry, emergency, notices and community usefulness should be checked before publishing rhythm starts.', 30
where not exists (select 1 from morning_desk_items where title = 'Scan local utility updates');

insert into morning_desk_items (title, lane, item_status, owner, target_time, notes, sort_order)
select 'Set the admin/editor handoff note', 'handoff', 'open', 'Admin / Editor', 'morning', 'Leave one short note about what needs attention next so the day does not depend on memory.', 40
where not exists (select 1 from morning_desk_items where title = 'Set the admin/editor handoff note');

insert into morning_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'Lead decision made', 'lead', 'The day has a clear first story, update or homepage focus.', false, 10
where not exists (select 1 from morning_desk_checks where title = 'Lead decision made');

insert into morning_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'Homepage does not feel stale', 'homepage', 'Hero, latest stories and local utility areas have been checked.', false, 20
where not exists (select 1 from morning_desk_checks where title = 'Homepage does not feel stale');

insert into morning_desk_checks (title, check_area, helper, is_ready, sort_order)
select 'No morning blockers', 'publishing', 'Any missing image, copy, source or homepage blocker has been named before publishing starts.', false, 30
where not exists (select 1 from morning_desk_checks where title = 'No morning blockers');
