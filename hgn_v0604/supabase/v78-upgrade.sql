-- HGN v78 - Editorial Calendar and Story Budget
-- Run after v77. This migration is defensive and safe to re-run.

create extension if not exists pgcrypto;

create table if not exists editorial_calendar_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  section text not null default 'news',
  status text not null default 'planned',
  priority text not null default 'normal',
  publish_date date not null default current_date,
  publish_window text not null default 'anytime',
  owner text,
  source_notes text,
  production_notes text,
  homepage_slot text,
  is_featured boolean not null default false,
  is_beta_critical boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table editorial_calendar_items add column if not exists slug text;
alter table editorial_calendar_items add column if not exists section text not null default 'news';
alter table editorial_calendar_items add column if not exists status text not null default 'planned';
alter table editorial_calendar_items add column if not exists priority text not null default 'normal';
alter table editorial_calendar_items add column if not exists publish_date date not null default current_date;
alter table editorial_calendar_items add column if not exists publish_window text not null default 'anytime';
alter table editorial_calendar_items add column if not exists owner text;
alter table editorial_calendar_items add column if not exists source_notes text;
alter table editorial_calendar_items add column if not exists production_notes text;
alter table editorial_calendar_items add column if not exists homepage_slot text;
alter table editorial_calendar_items add column if not exists is_featured boolean not null default false;
alter table editorial_calendar_items add column if not exists is_beta_critical boolean not null default false;
alter table editorial_calendar_items add column if not exists created_at timestamptz not null default now();
alter table editorial_calendar_items add column if not exists updated_at timestamptz not null default now();

create table if not exists story_budget_items (
  id uuid primary key default gen_random_uuid(),
  story_title text not null,
  section text not null default 'news',
  status text not null default 'idea',
  assignment_type text not null default 'article',
  reporter text,
  editor text,
  due_date date,
  expected_publish_date date,
  estimated_length text,
  art_needs text,
  notes text,
  blocker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table story_budget_items add column if not exists section text not null default 'news';
alter table story_budget_items add column if not exists status text not null default 'idea';
alter table story_budget_items add column if not exists assignment_type text not null default 'article';
alter table story_budget_items add column if not exists reporter text;
alter table story_budget_items add column if not exists editor text;
alter table story_budget_items add column if not exists due_date date;
alter table story_budget_items add column if not exists expected_publish_date date;
alter table story_budget_items add column if not exists estimated_length text;
alter table story_budget_items add column if not exists art_needs text;
alter table story_budget_items add column if not exists notes text;
alter table story_budget_items add column if not exists blocker text;
alter table story_budget_items add column if not exists created_at timestamptz not null default now();
alter table story_budget_items add column if not exists updated_at timestamptz not null default now();

create table if not exists publishing_windows (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  window_date date not null default current_date,
  window_time text not null default 'morning',
  status text not null default 'open',
  capacity integer not null default 5,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table publishing_windows add column if not exists window_date date not null default current_date;
alter table publishing_windows add column if not exists window_time text not null default 'morning';
alter table publishing_windows add column if not exists status text not null default 'open';
alter table publishing_windows add column if not exists capacity integer not null default 5;
alter table publishing_windows add column if not exists notes text;
alter table publishing_windows add column if not exists created_at timestamptz not null default now();
alter table publishing_windows add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_editorial_calendar_items_publish_date on editorial_calendar_items(publish_date desc);
create index if not exists idx_editorial_calendar_items_status on editorial_calendar_items(status);
create index if not exists idx_story_budget_items_due_date on story_budget_items(due_date desc);
create index if not exists idx_story_budget_items_status on story_budget_items(status);
create index if not exists idx_publishing_windows_date on publishing_windows(window_date desc);

insert into publishing_windows (label, window_date, window_time, status, capacity, notes)
select 'Beta morning edition', current_date, 'morning', 'open', 6, 'Default morning publishing window for beta launch operations.'
where not exists (select 1 from publishing_windows where label = 'Beta morning edition');

insert into editorial_calendar_items (title, section, status, priority, publish_date, publish_window, owner, production_notes, homepage_slot, is_featured, is_beta_critical)
select 'Beta launch explainer', 'newsroom', 'planned', 'high', current_date + 1, 'morning', 'Editor', 'Explain what beta readers can test and how to send feedback.', 'lead', true, true
where not exists (select 1 from editorial_calendar_items where title = 'Beta launch explainer');

insert into story_budget_items (story_title, section, status, assignment_type, reporter, editor, due_date, expected_publish_date, estimated_length, art_needs, notes)
select 'What readers should know before the HGN beta', 'newsroom', 'idea', 'article', 'Staff', 'Editor', current_date + 1, current_date + 2, '600-800', 'Logo or newsroom image', 'Seed story budget item for launch prep.'
where not exists (select 1 from story_budget_items where story_title = 'What readers should know before the HGN beta');
