-- HGN v66 Beta Operations Desk
-- Safe/idempotent upgrade for daily beta operations, incidents, release notes and public beta status.

create extension if not exists pgcrypto;

create table if not exists beta_incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text default 'General',
  severity text default 'normal',
  status text default 'open',
  summary text,
  owner text,
  public_note text,
  started_at timestamptz default now(),
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table beta_incidents add column if not exists area text default 'General';
alter table beta_incidents add column if not exists severity text default 'normal';
alter table beta_incidents add column if not exists status text default 'open';
alter table beta_incidents add column if not exists summary text;
alter table beta_incidents add column if not exists owner text;
alter table beta_incidents add column if not exists public_note text;
alter table beta_incidents add column if not exists started_at timestamptz default now();
alter table beta_incidents add column if not exists resolved_at timestamptz;
alter table beta_incidents add column if not exists updated_at timestamptz default now();

create table if not exists beta_release_notes (
  id uuid primary key default gen_random_uuid(),
  version text default 'beta',
  title text not null,
  summary text,
  audience text default 'internal',
  status text default 'draft',
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table beta_release_notes add column if not exists version text default 'beta';
alter table beta_release_notes add column if not exists summary text;
alter table beta_release_notes add column if not exists audience text default 'internal';
alter table beta_release_notes add column if not exists status text default 'draft';
alter table beta_release_notes add column if not exists published_at timestamptz default now();
alter table beta_release_notes add column if not exists updated_at timestamptz default now();

create table if not exists beta_site_checks (
  id uuid primary key default gen_random_uuid(),
  area text default 'Site',
  check_key text unique not null,
  label text not null,
  url text,
  status text default 'yellow',
  notes text,
  sort_order integer default 100,
  checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table beta_site_checks add column if not exists area text default 'Site';
alter table beta_site_checks add column if not exists url text;
alter table beta_site_checks add column if not exists status text default 'yellow';
alter table beta_site_checks add column if not exists notes text;
alter table beta_site_checks add column if not exists sort_order integer default 100;
alter table beta_site_checks add column if not exists checked_at timestamptz;
alter table beta_site_checks add column if not exists updated_at timestamptz default now();

create index if not exists idx_beta_incidents_status on beta_incidents(status);
create index if not exists idx_beta_incidents_severity on beta_incidents(severity);
create index if not exists idx_beta_release_notes_status on beta_release_notes(status);
create index if not exists idx_beta_release_notes_audience on beta_release_notes(audience);
create index if not exists idx_beta_site_checks_status on beta_site_checks(status);
create index if not exists idx_beta_site_checks_sort on beta_site_checks(sort_order);

insert into beta_site_checks (area, check_key, label, url, status, sort_order)
select 'Publishing', 'homepage', 'Homepage loads and shows current local stories', '/', 'yellow', 10
where not exists (select 1 from beta_site_checks where check_key = 'homepage');

insert into beta_site_checks (area, check_key, label, url, status, sort_order)
select 'Publishing', 'article_pages', 'Article pages render cleanly on mobile', '/articles', 'yellow', 20
where not exists (select 1 from beta_site_checks where check_key = 'article_pages');

insert into beta_site_checks (area, check_key, label, url, status, sort_order)
select 'Submissions', 'beta_feedback', 'Beta feedback form works end to end', '/beta-feedback', 'yellow', 30
where not exists (select 1 from beta_site_checks where check_key = 'beta_feedback');

insert into beta_site_checks (area, check_key, label, url, status, sort_order)
select 'Google News', 'rss', 'RSS feed returns current published stories', '/rss.xml', 'yellow', 40
where not exists (select 1 from beta_site_checks where check_key = 'rss');

insert into beta_site_checks (area, check_key, label, url, status, sort_order)
select 'Google News', 'news_sitemap', 'News sitemap is valid for indexing', '/news-sitemap.xml', 'yellow', 50
where not exists (select 1 from beta_site_checks where check_key = 'news_sitemap');

insert into beta_site_checks (area, check_key, label, url, status, sort_order)
select 'Community', 'submission_desk', 'Admin submission desk shows incoming community items', '/admin/submission-desk', 'yellow', 60
where not exists (select 1 from beta_site_checks where check_key = 'submission_desk');

insert into beta_site_checks (area, check_key, label, url, status, sort_order)
select 'Operations', 'beta_status', 'Public beta status page is available for testers', '/beta-status', 'yellow', 70
where not exists (select 1 from beta_site_checks where check_key = 'beta_status');

insert into beta_release_notes (version, title, summary, audience, status, published_at)
select 'v66', 'Beta Operations Desk added', 'Adds incident tracking, release notes, site checks and a public beta status page so testers know what is stable and what still needs attention.', 'beta-readers', 'published', now()
where not exists (select 1 from beta_release_notes where version = 'v66' and title = 'Beta Operations Desk added');
