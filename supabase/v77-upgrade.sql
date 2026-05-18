-- HGN v77 Upgrade: Analytics Command Center
-- Adds beta analytics snapshots, newsroom KPI tracking and traffic source summaries.

create extension if not exists pgcrypto;

create table if not exists analytics_story_snapshots (
  id uuid primary key default gen_random_uuid(),
  story_title text not null,
  story_slug text,
  section text default 'news',
  status text not null default 'tracking',
  snapshot_date date not null default current_date,
  views integer not null default 0,
  unique_visitors integer not null default 0,
  newsletter_clicks integer not null default 0,
  social_clicks integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  conversion_notes text,
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table analytics_story_snapshots add column if not exists story_slug text;
alter table analytics_story_snapshots add column if not exists section text default 'news';
alter table analytics_story_snapshots add column if not exists status text not null default 'tracking';
alter table analytics_story_snapshots add column if not exists snapshot_date date not null default current_date;
alter table analytics_story_snapshots add column if not exists views integer not null default 0;
alter table analytics_story_snapshots add column if not exists unique_visitors integer not null default 0;
alter table analytics_story_snapshots add column if not exists newsletter_clicks integer not null default 0;
alter table analytics_story_snapshots add column if not exists social_clicks integer not null default 0;
alter table analytics_story_snapshots add column if not exists comments_count integer not null default 0;
alter table analytics_story_snapshots add column if not exists shares_count integer not null default 0;
alter table analytics_story_snapshots add column if not exists conversion_notes text;
alter table analytics_story_snapshots add column if not exists editor_notes text;
alter table analytics_story_snapshots add column if not exists created_at timestamptz not null default now();
alter table analytics_story_snapshots add column if not exists updated_at timestamptz not null default now();

create table if not exists newsroom_kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null default current_date,
  label text not null,
  category text not null default 'audience',
  value numeric not null default 0,
  target numeric,
  status text not null default 'watch',
  notes text,
  created_at timestamptz not null default now()
);

alter table newsroom_kpi_snapshots add column if not exists snapshot_date date not null default current_date;
alter table newsroom_kpi_snapshots add column if not exists label text;
alter table newsroom_kpi_snapshots add column if not exists category text not null default 'audience';
alter table newsroom_kpi_snapshots add column if not exists value numeric not null default 0;
alter table newsroom_kpi_snapshots add column if not exists target numeric;
alter table newsroom_kpi_snapshots add column if not exists status text not null default 'watch';
alter table newsroom_kpi_snapshots add column if not exists notes text;
alter table newsroom_kpi_snapshots add column if not exists created_at timestamptz not null default now();

create table if not exists traffic_source_summaries (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_type text not null default 'referral',
  status text not null default 'tracking',
  snapshot_date date not null default current_date,
  sessions integer not null default 0,
  visitors integer not null default 0,
  signups integer not null default 0,
  top_landing_page text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table traffic_source_summaries add column if not exists source_type text not null default 'referral';
alter table traffic_source_summaries add column if not exists status text not null default 'tracking';
alter table traffic_source_summaries add column if not exists snapshot_date date not null default current_date;
alter table traffic_source_summaries add column if not exists sessions integer not null default 0;
alter table traffic_source_summaries add column if not exists visitors integer not null default 0;
alter table traffic_source_summaries add column if not exists signups integer not null default 0;
alter table traffic_source_summaries add column if not exists top_landing_page text;
alter table traffic_source_summaries add column if not exists notes text;
alter table traffic_source_summaries add column if not exists created_at timestamptz not null default now();
alter table traffic_source_summaries add column if not exists updated_at timestamptz not null default now();

create table if not exists beta_engagement_reviews (
  id uuid primary key default gen_random_uuid(),
  review_title text not null,
  status text not null default 'open',
  review_period text default 'weekly',
  signal text default 'watch',
  what_worked text,
  what_needs_work text,
  next_action text,
  owner text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table beta_engagement_reviews add column if not exists status text not null default 'open';
alter table beta_engagement_reviews add column if not exists review_period text default 'weekly';
alter table beta_engagement_reviews add column if not exists signal text default 'watch';
alter table beta_engagement_reviews add column if not exists what_worked text;
alter table beta_engagement_reviews add column if not exists what_needs_work text;
alter table beta_engagement_reviews add column if not exists next_action text;
alter table beta_engagement_reviews add column if not exists owner text;
alter table beta_engagement_reviews add column if not exists due_at timestamptz;
alter table beta_engagement_reviews add column if not exists completed_at timestamptz;
alter table beta_engagement_reviews add column if not exists created_at timestamptz not null default now();
alter table beta_engagement_reviews add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_analytics_story_snapshots_date on analytics_story_snapshots(snapshot_date desc);
create index if not exists idx_analytics_story_snapshots_status on analytics_story_snapshots(status);
create index if not exists idx_newsroom_kpi_snapshots_date on newsroom_kpi_snapshots(snapshot_date desc);
create index if not exists idx_traffic_source_summaries_date on traffic_source_summaries(snapshot_date desc);
create index if not exists idx_beta_engagement_reviews_status on beta_engagement_reviews(status);

insert into analytics_story_snapshots (story_title, story_slug, section, status, views, unique_visitors, newsletter_clicks, social_clicks, editor_notes)
values
  ('Beta launch explainer', 'beta-launch-explainer', 'newsroom', 'tracking', 0, 0, 0, 0, 'Use this placeholder to track the first public beta explainer.'),
  ('How to submit community news', 'submit-community-news', 'community', 'tracking', 0, 0, 0, 0, 'Track whether readers understand submission pathways.')
on conflict do nothing;

insert into newsroom_kpi_snapshots (label, category, value, target, status, notes)
values
  ('Weekly published stories', 'editorial', 0, 10, 'watch', 'Track whether HGN can maintain a reliable publishing rhythm.'),
  ('Newsletter signups', 'audience', 0, 100, 'watch', 'Use during beta to evaluate reader conversion.'),
  ('Open beta blockers', 'operations', 0, 0, 'watch', 'Keep this near zero before public beta.')
on conflict do nothing;

insert into traffic_source_summaries (source_name, source_type, status, sessions, visitors, signups, top_landing_page, notes)
values
  ('Direct / typed URL', 'direct', 'tracking', 0, 0, 0, '/', 'Baseline local awareness.'),
  ('Facebook community groups', 'social', 'tracking', 0, 0, 0, '/', 'Likely early traffic source for local stories.'),
  ('Newsletter', 'email', 'tracking', 0, 0, 0, '/newsletter', 'Measure newsletter-driven repeat visits.')
on conflict do nothing;

insert into beta_engagement_reviews (review_title, status, review_period, signal, what_worked, what_needs_work, next_action, owner)
values
  ('First beta engagement review', 'open', 'weekly', 'watch', 'Identify the stories and channels readers actually use.', 'Replace placeholder metrics with real data after launch.', 'Review analytics every Friday during beta.', 'Editor')
on conflict do nothing;
