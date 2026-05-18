-- HGN v106 Publishing Compass
-- Lightweight two-person publishing direction board for daily beta operations.

create table if not exists publishing_compass_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  compass_area text not null default 'today',
  item_status text not null default 'open',
  priority text not null default 'normal',
  owner text not null default 'Admin / Editor',
  target_window text,
  notes text,
  is_done boolean not null default false,
  sort_order integer not null default 100,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists publishing_compass_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'publishing',
  helper text,
  is_ready boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table publishing_compass_items add column if not exists title text;
alter table publishing_compass_items add column if not exists compass_area text not null default 'today';
alter table publishing_compass_items add column if not exists item_status text not null default 'open';
alter table publishing_compass_items add column if not exists priority text not null default 'normal';
alter table publishing_compass_items add column if not exists owner text not null default 'Admin / Editor';
alter table publishing_compass_items add column if not exists target_window text;
alter table publishing_compass_items add column if not exists notes text;
alter table publishing_compass_items add column if not exists is_done boolean not null default false;
alter table publishing_compass_items add column if not exists sort_order integer not null default 100;
alter table publishing_compass_items add column if not exists completed_at timestamptz;
alter table publishing_compass_items add column if not exists created_at timestamptz not null default now();
alter table publishing_compass_items add column if not exists updated_at timestamptz not null default now();

alter table publishing_compass_checks add column if not exists title text;
alter table publishing_compass_checks add column if not exists check_area text not null default 'publishing';
alter table publishing_compass_checks add column if not exists helper text;
alter table publishing_compass_checks add column if not exists is_ready boolean not null default false;
alter table publishing_compass_checks add column if not exists sort_order integer not null default 100;
alter table publishing_compass_checks add column if not exists created_at timestamptz not null default now();
alter table publishing_compass_checks add column if not exists updated_at timestamptz not null default now();

create index if not exists publishing_compass_items_status_idx on publishing_compass_items (item_status);
create index if not exists publishing_compass_items_area_idx on publishing_compass_items (compass_area);
create index if not exists publishing_compass_items_sort_idx on publishing_compass_items (sort_order);
create index if not exists publishing_compass_checks_sort_idx on publishing_compass_checks (sort_order);

insert into publishing_compass_items (title, compass_area, item_status, priority, owner, target_window, notes, sort_order)
select * from (values
  ('Pick the main story direction for today', 'today', 'open', 'high', 'Admin / Editor', 'Morning', 'Decide the lead story before smaller admin tasks take over.', 10),
  ('Confirm homepage lead and second slot', 'homepage', 'open', 'high', 'Admin / Editor', 'Before publish', 'Make the homepage reflect the real priority for the day.', 20),
  ('Choose one cleanup item to finish today', 'cleanup', 'open', 'normal', 'Admin / Editor', 'Anytime', 'Keep beta progress moving without opening too many new loops.', 30)
) as seed(title, compass_area, item_status, priority, owner, target_window, notes, sort_order)
where not exists (select 1 from publishing_compass_items where publishing_compass_items.title = seed.title);

insert into publishing_compass_checks (title, check_area, helper, is_ready, sort_order)
select * from (values
  ('Today has one clear publishing priority', 'today', 'The admin and editor both know what should go live first.', false, 10),
  ('Homepage direction is clear', 'homepage', 'Hero, secondary story and stale items have been checked.', false, 20),
  ('No major blocker is hiding in another desk', 'workflow', 'Check Core, Shift Center, Cleanup Desk and Publish Sweep before pushing live.', false, 30)
) as seed(title, check_area, helper, is_ready, sort_order)
where not exists (select 1 from publishing_compass_checks where publishing_compass_checks.title = seed.title);
