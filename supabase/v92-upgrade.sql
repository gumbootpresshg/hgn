-- HGN v92 - Homepage Control
-- Focus: two-person admin/editor homepage management for daily beta operations.

create extension if not exists pgcrypto;

create table if not exists homepage_control_slots (
  id uuid primary key default gen_random_uuid(),
  slot_key text not null unique,
  slot_label text not null,
  section text not null default 'front_page',
  article_slug text,
  story_title text,
  deck text,
  image_url text,
  slot_order integer not null default 0,
  is_visible boolean not null default true,
  is_pinned boolean not null default false,
  status text not null default 'empty',
  freshness_hours integer not null default 24,
  owner text,
  notes text,
  published_at timestamptz,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table homepage_control_slots add column if not exists slot_key text;
alter table homepage_control_slots add column if not exists slot_label text;
alter table homepage_control_slots add column if not exists section text not null default 'front_page';
alter table homepage_control_slots add column if not exists article_slug text;
alter table homepage_control_slots add column if not exists story_title text;
alter table homepage_control_slots add column if not exists deck text;
alter table homepage_control_slots add column if not exists image_url text;
alter table homepage_control_slots add column if not exists slot_order integer not null default 0;
alter table homepage_control_slots add column if not exists is_visible boolean not null default true;
alter table homepage_control_slots add column if not exists is_pinned boolean not null default false;
alter table homepage_control_slots add column if not exists status text not null default 'empty';
alter table homepage_control_slots add column if not exists freshness_hours integer not null default 24;
alter table homepage_control_slots add column if not exists owner text;
alter table homepage_control_slots add column if not exists notes text;
alter table homepage_control_slots add column if not exists published_at timestamptz;
alter table homepage_control_slots add column if not exists last_checked_at timestamptz;
alter table homepage_control_slots add column if not exists created_at timestamptz not null default now();
alter table homepage_control_slots add column if not exists updated_at timestamptz not null default now();

create table if not exists homepage_control_checks (
  id uuid primary key default gen_random_uuid(),
  check_label text not null,
  check_area text not null default 'homepage',
  status text not null default 'todo',
  priority text not null default 'normal',
  owner text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table homepage_control_checks add column if not exists check_label text;
alter table homepage_control_checks add column if not exists check_area text not null default 'homepage';
alter table homepage_control_checks add column if not exists status text not null default 'todo';
alter table homepage_control_checks add column if not exists priority text not null default 'normal';
alter table homepage_control_checks add column if not exists owner text;
alter table homepage_control_checks add column if not exists notes text;
alter table homepage_control_checks add column if not exists completed_at timestamptz;
alter table homepage_control_checks add column if not exists created_at timestamptz not null default now();
alter table homepage_control_checks add column if not exists updated_at timestamptz not null default now();

create table if not exists homepage_control_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_label text not null default 'Homepage check',
  readiness_score integer not null default 0,
  visible_slots integer not null default 0,
  stale_slots integer not null default 0,
  empty_slots integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_homepage_control_slots_order on homepage_control_slots(section, slot_order);
create index if not exists idx_homepage_control_slots_status on homepage_control_slots(status);
create index if not exists idx_homepage_control_checks_status on homepage_control_checks(status);
create index if not exists idx_homepage_control_snapshots_created on homepage_control_snapshots(created_at desc);

insert into homepage_control_slots (slot_key, slot_label, section, slot_order, status, freshness_hours, notes)
values
  ('hero', 'Main hero story', 'front_page', 1, 'empty', 18, 'The top story people should see first.'),
  ('secondary_one', 'Secondary lead', 'front_page', 2, 'empty', 24, 'Useful for the next strongest local story.'),
  ('secondary_two', 'Second secondary lead', 'front_page', 3, 'empty', 24, 'Keep this fresh enough that the page feels alive.'),
  ('community', 'Community notice / service item', 'front_page', 4, 'empty', 48, 'Events, notices, ferry/weather/service updates.'),
  ('evergreen', 'Evergreen/local guide slot', 'front_page', 5, 'empty', 168, 'A useful older or evergreen item can live here.')
on conflict (slot_key) do nothing;

insert into homepage_control_checks (check_label, check_area, priority, notes)
values
  ('Hero story is current and local', 'front_page', 'high', 'The front page should not feel stale.'),
  ('Featured image, alt text, and credit are ready', 'media', 'high', 'Avoid publishing image gaps on the homepage.'),
  ('Mobile homepage scan completed', 'mobile', 'normal', 'Quick phone check before calling the day good.'),
  ('Newsletter/social story links are obvious', 'distribution', 'normal', 'Make sure important stories can be found and shared.'),
  ('No empty high-priority homepage slots', 'front_page', 'high', 'Hero and secondary slots should be filled or intentionally hidden.')
on conflict do nothing;
