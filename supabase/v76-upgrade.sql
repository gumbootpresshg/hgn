-- HGN v76 Upgrade: Newsletter Dispatch Desk
-- Adds beta-ready newsletter planning, edition tracking and public archive support.

create extension if not exists pgcrypto;

create table if not exists newsletter_editions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  subject_line text,
  status text not null default 'draft',
  edition_type text not null default 'daily',
  audience_segment text default 'all_readers',
  intro text,
  top_story_title text,
  top_story_url text,
  secondary_story_title text,
  secondary_story_url text,
  sponsor_note text,
  editor_note text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  published_at timestamptz,
  created_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table newsletter_editions add column if not exists slug text;
alter table newsletter_editions add column if not exists subject_line text;
alter table newsletter_editions add column if not exists status text not null default 'draft';
alter table newsletter_editions add column if not exists edition_type text not null default 'daily';
alter table newsletter_editions add column if not exists audience_segment text default 'all_readers';
alter table newsletter_editions add column if not exists intro text;
alter table newsletter_editions add column if not exists top_story_title text;
alter table newsletter_editions add column if not exists top_story_url text;
alter table newsletter_editions add column if not exists secondary_story_title text;
alter table newsletter_editions add column if not exists secondary_story_url text;
alter table newsletter_editions add column if not exists sponsor_note text;
alter table newsletter_editions add column if not exists editor_note text;
alter table newsletter_editions add column if not exists scheduled_for timestamptz;
alter table newsletter_editions add column if not exists sent_at timestamptz;
alter table newsletter_editions add column if not exists published_at timestamptz;
alter table newsletter_editions add column if not exists created_by text;
alter table newsletter_editions add column if not exists notes text;
alter table newsletter_editions add column if not exists created_at timestamptz not null default now();
alter table newsletter_editions add column if not exists updated_at timestamptz not null default now();

create table if not exists newsletter_segments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  status text not null default 'active',
  target_reader text,
  estimated_recipients integer not null default 0,
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table newsletter_segments add column if not exists description text;
alter table newsletter_segments add column if not exists status text not null default 'active';
alter table newsletter_segments add column if not exists target_reader text;
alter table newsletter_segments add column if not exists estimated_recipients integer not null default 0;
alter table newsletter_segments add column if not exists source text;
alter table newsletter_segments add column if not exists notes text;
alter table newsletter_segments add column if not exists created_at timestamptz not null default now();
alter table newsletter_segments add column if not exists updated_at timestamptz not null default now();

create table if not exists newsletter_dispatch_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  phase text not null default 'prep',
  status text not null default 'todo',
  owner text,
  due_at timestamptz,
  checklist_order integer not null default 0,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table newsletter_dispatch_tasks add column if not exists phase text not null default 'prep';
alter table newsletter_dispatch_tasks add column if not exists status text not null default 'todo';
alter table newsletter_dispatch_tasks add column if not exists owner text;
alter table newsletter_dispatch_tasks add column if not exists due_at timestamptz;
alter table newsletter_dispatch_tasks add column if not exists checklist_order integer not null default 0;
alter table newsletter_dispatch_tasks add column if not exists notes text;
alter table newsletter_dispatch_tasks add column if not exists completed_at timestamptz;
alter table newsletter_dispatch_tasks add column if not exists created_at timestamptz not null default now();
alter table newsletter_dispatch_tasks add column if not exists updated_at timestamptz not null default now();

create table if not exists newsletter_metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid references newsletter_editions(id) on delete set null,
  metric_date date not null default current_date,
  subscriber_count integer not null default 0,
  sent_count integer not null default 0,
  open_count integer not null default 0,
  click_count integer not null default 0,
  unsubscribe_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

alter table newsletter_metrics_snapshots add column if not exists edition_id uuid references newsletter_editions(id) on delete set null;
alter table newsletter_metrics_snapshots add column if not exists metric_date date not null default current_date;
alter table newsletter_metrics_snapshots add column if not exists subscriber_count integer not null default 0;
alter table newsletter_metrics_snapshots add column if not exists sent_count integer not null default 0;
alter table newsletter_metrics_snapshots add column if not exists open_count integer not null default 0;
alter table newsletter_metrics_snapshots add column if not exists click_count integer not null default 0;
alter table newsletter_metrics_snapshots add column if not exists unsubscribe_count integer not null default 0;
alter table newsletter_metrics_snapshots add column if not exists notes text;
alter table newsletter_metrics_snapshots add column if not exists created_at timestamptz not null default now();

create index if not exists idx_newsletter_editions_status on newsletter_editions(status);
create index if not exists idx_newsletter_editions_published on newsletter_editions(published_at desc);
create index if not exists idx_newsletter_segments_status on newsletter_segments(status);
create index if not exists idx_newsletter_dispatch_tasks_status on newsletter_dispatch_tasks(status);
create index if not exists idx_newsletter_metrics_date on newsletter_metrics_snapshots(metric_date desc);

insert into newsletter_segments (name, description, status, target_reader, estimated_recipients, source)
values
  ('all_readers', 'Main HGN beta reader list.', 'active', 'General readers', 0, 'newsletter signup'),
  ('beta_testers', 'Closed beta testers and early community reviewers.', 'active', 'Beta testers', 0, 'beta join form'),
  ('advertisers', 'Advertiser and sponsor update list.', 'active', 'Local businesses', 0, 'media kit / sales')
on conflict (name) do nothing;

insert into newsletter_dispatch_tasks (title, phase, status, checklist_order, notes)
values
  ('Confirm top story and headline before send', 'editorial', 'todo', 10, 'Avoid sending a newsletter without one clear lead item.'),
  ('Check links, images and sponsor placement', 'qa', 'todo', 20, 'Open every link before sending.'),
  ('Confirm audience segment and send time', 'dispatch', 'todo', 30, 'Beta sends should be deliberate and trackable.'),
  ('Record metrics after send', 'followup', 'todo', 40, 'Capture subscriber, open, click and unsubscribe totals.')
on conflict do nothing;

insert into newsletter_editions (title, slug, subject_line, status, edition_type, audience_segment, intro, top_story_title, editor_note, notes)
values
  ('Beta dispatch draft', 'beta-dispatch-draft', 'HGN beta update from Haida Gwaii', 'draft', 'beta', 'beta_testers', 'Use this draft as the first controlled beta newsletter send.', 'Top story placeholder', 'Keep the first beta send short, useful and local.', 'Created by v76 upgrade.')
on conflict (slug) do nothing;
