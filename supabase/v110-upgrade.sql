-- HGN v110 - Edition Planner
-- Lightweight daily edition planning for the two-person admin/editor beta workflow.

create extension if not exists pgcrypto;

create table if not exists edition_planner_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slot_type text not null default 'secondary',
  edition_status text not null default 'planned',
  homepage_area text not null default 'homepage',
  owner text not null default 'Admin / Editor',
  publish_window text not null default 'today',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table edition_planner_items add column if not exists title text;
alter table edition_planner_items add column if not exists slot_type text not null default 'secondary';
alter table edition_planner_items add column if not exists edition_status text not null default 'planned';
alter table edition_planner_items add column if not exists homepage_area text not null default 'homepage';
alter table edition_planner_items add column if not exists owner text not null default 'Admin / Editor';
alter table edition_planner_items add column if not exists publish_window text not null default 'today';
alter table edition_planner_items add column if not exists notes text;
alter table edition_planner_items add column if not exists sort_order integer not null default 100;
alter table edition_planner_items add column if not exists created_at timestamptz not null default now();
alter table edition_planner_items add column if not exists updated_at timestamptz not null default now();

create index if not exists edition_planner_items_status_idx on edition_planner_items (edition_status);
create index if not exists edition_planner_items_slot_idx on edition_planner_items (slot_type);
create index if not exists edition_planner_items_sort_idx on edition_planner_items (sort_order);

create table if not exists edition_planner_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'edition',
  helper text,
  is_ready boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table edition_planner_checks add column if not exists title text;
alter table edition_planner_checks add column if not exists check_area text not null default 'edition';
alter table edition_planner_checks add column if not exists helper text;
alter table edition_planner_checks add column if not exists is_ready boolean not null default false;
alter table edition_planner_checks add column if not exists sort_order integer not null default 100;
alter table edition_planner_checks add column if not exists created_at timestamptz not null default now();
alter table edition_planner_checks add column if not exists updated_at timestamptz not null default now();

create index if not exists edition_planner_checks_area_idx on edition_planner_checks (check_area);
create index if not exists edition_planner_checks_ready_idx on edition_planner_checks (is_ready);

insert into edition_planner_items (title, slot_type, edition_status, homepage_area, owner, publish_window, notes, sort_order)
select 'Pick today''s lead story', 'lead', 'planned', 'hero', 'Admin / Editor', 'morning', 'Choose the one story or update that should anchor the homepage today.', 10
where not exists (select 1 from edition_planner_items where title = 'Pick today''s lead story');

insert into edition_planner_items (title, slot_type, edition_status, homepage_area, owner, publish_window, notes, sort_order)
select 'Check local utility updates', 'utility', 'planned', 'utility rail', 'Admin / Editor', 'morning', 'Weather, ferry, emergency, community and other local usefulness before the edition feels complete.', 20
where not exists (select 1 from edition_planner_items where title = 'Check local utility updates');

insert into edition_planner_items (title, slot_type, edition_status, homepage_area, owner, publish_window, notes, sort_order)
select 'Set afternoon refresh item', 'secondary', 'planned', 'latest news', 'Admin / Editor', 'afternoon', 'Pick one small update that keeps the site from feeling static later in the day.', 30
where not exists (select 1 from edition_planner_items where title = 'Set afternoon refresh item');

insert into edition_planner_checks (title, check_area, helper, is_ready, sort_order)
select 'Lead story is clear', 'homepage', 'The homepage should make it obvious what matters most today.', false, 10
where not exists (select 1 from edition_planner_checks where title = 'Lead story is clear');

insert into edition_planner_checks (title, check_area, helper, is_ready, sort_order)
select 'Homepage has a fresh rhythm', 'homepage', 'At least one lead, one secondary item and one local utility/community item are planned.', false, 20
where not exists (select 1 from edition_planner_checks where title = 'Homepage has a fresh rhythm');

insert into edition_planner_checks (title, check_area, helper, is_ready, sort_order)
select 'No unresolved blockers', 'publishing', 'Do not publish the edition plan with blocked lead or required image/copy issues.', false, 30
where not exists (select 1 from edition_planner_checks where title = 'No unresolved blockers');
