-- HGN v83 - Archive Intelligence
-- Adds archive tagging, historical topic indexing, evergreen resurfacing, and archive QA tracking.

create extension if not exists pgcrypto;

create table if not exists public.archive_topic_index (
  id uuid primary key default gen_random_uuid(),
  topic_name text not null,
  topic_slug text not null unique,
  description text,
  era_label text,
  coverage_area text,
  status text not null default 'active',
  priority text not null default 'normal',
  owner text,
  source_count integer not null default 0,
  last_reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archive_article_tags (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  article_title text not null,
  article_slug text,
  topic_id uuid references public.archive_topic_index(id) on delete set null,
  tag_name text not null,
  historical_value text not null default 'medium',
  verification_status text not null default 'needs-review',
  archive_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evergreen_resurfacing_queue (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  source_url text,
  topic_name text,
  publish_window text,
  suggested_channel text not null default 'homepage',
  status text not null default 'queued',
  priority text not null default 'normal',
  reason text,
  owner text,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archive_search_qa_checks (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  expected_result text,
  actual_result text,
  status text not null default 'needs-review',
  priority text not null default 'normal',
  issue_type text not null default 'relevance',
  route_path text not null default '/archive-explorer',
  owner text,
  notes text,
  checked_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.archive_topic_index add column if not exists topic_name text;
alter table public.archive_topic_index add column if not exists topic_slug text;
alter table public.archive_topic_index add column if not exists description text;
alter table public.archive_topic_index add column if not exists era_label text;
alter table public.archive_topic_index add column if not exists coverage_area text;
alter table public.archive_topic_index add column if not exists status text not null default 'active';
alter table public.archive_topic_index add column if not exists priority text not null default 'normal';
alter table public.archive_topic_index add column if not exists owner text;
alter table public.archive_topic_index add column if not exists source_count integer not null default 0;
alter table public.archive_topic_index add column if not exists last_reviewed_at timestamptz;
alter table public.archive_topic_index add column if not exists notes text;
alter table public.archive_topic_index add column if not exists created_at timestamptz not null default now();
alter table public.archive_topic_index add column if not exists updated_at timestamptz not null default now();

alter table public.archive_article_tags add column if not exists article_id uuid;
alter table public.archive_article_tags add column if not exists article_title text;
alter table public.archive_article_tags add column if not exists article_slug text;
alter table public.archive_article_tags add column if not exists topic_id uuid;
alter table public.archive_article_tags add column if not exists tag_name text;
alter table public.archive_article_tags add column if not exists historical_value text not null default 'medium';
alter table public.archive_article_tags add column if not exists verification_status text not null default 'needs-review';
alter table public.archive_article_tags add column if not exists archive_note text;
alter table public.archive_article_tags add column if not exists created_at timestamptz not null default now();
alter table public.archive_article_tags add column if not exists updated_at timestamptz not null default now();

alter table public.evergreen_resurfacing_queue add column if not exists headline text;
alter table public.evergreen_resurfacing_queue add column if not exists source_url text;
alter table public.evergreen_resurfacing_queue add column if not exists topic_name text;
alter table public.evergreen_resurfacing_queue add column if not exists publish_window text;
alter table public.evergreen_resurfacing_queue add column if not exists suggested_channel text not null default 'homepage';
alter table public.evergreen_resurfacing_queue add column if not exists status text not null default 'queued';
alter table public.evergreen_resurfacing_queue add column if not exists priority text not null default 'normal';
alter table public.evergreen_resurfacing_queue add column if not exists reason text;
alter table public.evergreen_resurfacing_queue add column if not exists owner text;
alter table public.evergreen_resurfacing_queue add column if not exists target_date date;
alter table public.evergreen_resurfacing_queue add column if not exists completed_at timestamptz;
alter table public.evergreen_resurfacing_queue add column if not exists created_at timestamptz not null default now();
alter table public.evergreen_resurfacing_queue add column if not exists updated_at timestamptz not null default now();

alter table public.archive_search_qa_checks add column if not exists query text;
alter table public.archive_search_qa_checks add column if not exists expected_result text;
alter table public.archive_search_qa_checks add column if not exists actual_result text;
alter table public.archive_search_qa_checks add column if not exists status text not null default 'needs-review';
alter table public.archive_search_qa_checks add column if not exists priority text not null default 'normal';
alter table public.archive_search_qa_checks add column if not exists issue_type text not null default 'relevance';
alter table public.archive_search_qa_checks add column if not exists route_path text not null default '/archive-explorer';
alter table public.archive_search_qa_checks add column if not exists owner text;
alter table public.archive_search_qa_checks add column if not exists notes text;
alter table public.archive_search_qa_checks add column if not exists checked_at timestamptz;
alter table public.archive_search_qa_checks add column if not exists resolved_at timestamptz;
alter table public.archive_search_qa_checks add column if not exists created_at timestamptz not null default now();
alter table public.archive_search_qa_checks add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_archive_topic_index_status on public.archive_topic_index(status);
create index if not exists idx_archive_topic_index_slug on public.archive_topic_index(topic_slug);
create index if not exists idx_archive_article_tags_topic on public.archive_article_tags(topic_id);
create index if not exists idx_archive_article_tags_status on public.archive_article_tags(verification_status);
create index if not exists idx_evergreen_resurfacing_queue_status on public.evergreen_resurfacing_queue(status);
create index if not exists idx_archive_search_qa_checks_status on public.archive_search_qa_checks(status);

insert into public.archive_topic_index (topic_name, topic_slug, description, era_label, coverage_area, status, priority, source_count, notes)
values
  ('Ferries and transportation', 'ferries-transportation', 'Long-running ferry, road, airport, and inter-island mobility coverage.', 'ongoing', 'Haida Gwaii', 'active', 'high', 0, 'Seed topic for beta archive testing.'),
  ('Housing and affordability', 'housing-affordability', 'Stories about housing, rentals, building, affordability, and local planning.', 'ongoing', 'Haida Gwaii', 'active', 'high', 0, 'Seed topic for evergreen resurfacing.'),
  ('Language, culture and history', 'language-culture-history', 'Archive path for cultural, historical, arts, language, and community memory coverage.', 'ongoing', 'Haida Gwaii', 'active', 'normal', 0, 'Seed topic for historical archive exploration.')
on conflict (topic_slug) do nothing;

insert into public.evergreen_resurfacing_queue (headline, topic_name, publish_window, suggested_channel, status, priority, reason)
values
  ('Build a beta archive collection for ferry explainers', 'Ferries and transportation', 'Beta week', 'homepage', 'queued', 'high', 'Useful for visitors and residents during transport disruptions.'),
  ('Surface housing backgrounders beside new housing stories', 'Housing and affordability', 'Next relevant story', 'related links', 'queued', 'high', 'Adds context and improves archive value.'),
  ('Prepare a culture/history archive landing set', 'Language, culture and history', 'Launch month', 'archive-explorer', 'queued', 'normal', 'Helps the archive feel local and distinctive.')
on conflict do nothing;

insert into public.archive_search_qa_checks (query, expected_result, status, priority, issue_type, notes)
values
  ('ferry schedule', 'Transportation and ferry-related archive stories should appear first.', 'needs-review', 'high', 'relevance', 'Seed QA check.'),
  ('housing', 'Housing and affordability topic pages or tagged stories should be easy to find.', 'needs-review', 'high', 'coverage', 'Seed QA check.'),
  ('Haida culture', 'Culture/history stories should surface with respectful metadata.', 'needs-review', 'normal', 'metadata', 'Seed QA check.')
on conflict do nothing;
