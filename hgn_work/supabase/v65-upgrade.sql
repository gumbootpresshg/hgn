-- HGN v65 Beta Command Centre
-- Safe/idempotent upgrade for private beta operations, launch triage and tester sessions.

create extension if not exists pgcrypto;

-- Strengthen launch checklist so it can drive a real beta readiness score.
create table if not exists launch_checklist (
  id uuid primary key default gen_random_uuid(),
  area text,
  item text,
  title text,
  notes text,
  status text default 'todo',
  priority integer default 0,
  blocking boolean default false,
  owner text,
  due_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table launch_checklist add column if not exists area text;
alter table launch_checklist add column if not exists item text;
alter table launch_checklist add column if not exists title text;
alter table launch_checklist add column if not exists notes text;
alter table launch_checklist add column if not exists status text default 'todo';
alter table launch_checklist add column if not exists priority integer default 0;
alter table launch_checklist add column if not exists blocking boolean default false;
alter table launch_checklist add column if not exists owner text;
alter table launch_checklist add column if not exists due_at timestamptz;
alter table launch_checklist add column if not exists updated_at timestamptz default now();

-- Tester sessions let you run structured passes: mobile, editor, advertiser, contributor, reader.
create table if not exists beta_test_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tester_name text,
  tester_email text,
  device text,
  browser text,
  focus_area text,
  status text default 'active',
  notes text,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table beta_test_sessions add column if not exists tester_email text;
alter table beta_test_sessions add column if not exists focus_area text;
alter table beta_test_sessions add column if not exists notes text;
alter table beta_test_sessions add column if not exists started_at timestamptz default now();
alter table beta_test_sessions add column if not exists completed_at timestamptz;
alter table beta_test_sessions add column if not exists updated_at timestamptz default now();

create table if not exists beta_test_tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid,
  area text,
  task text not null,
  expected_result text,
  status text default 'todo',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table beta_test_tasks add column if not exists session_id uuid;
alter table beta_test_tasks add column if not exists area text;
alter table beta_test_tasks add column if not exists expected_result text;
alter table beta_test_tasks add column if not exists status text default 'todo';
alter table beta_test_tasks add column if not exists notes text;
alter table beta_test_tasks add column if not exists updated_at timestamptz default now();

-- Expand beta feedback enough for triage.
create table if not exists beta_feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  page_url text,
  issue_type text,
  message text,
  severity text default 'normal',
  status text default 'new',
  assigned_to text,
  device text,
  browser text,
  screenshot_url text,
  fixed_at timestamptz,
  created_at timestamptz default now()
);
alter table beta_feedback add column if not exists severity text default 'normal';
alter table beta_feedback add column if not exists assigned_to text;
alter table beta_feedback add column if not exists device text;
alter table beta_feedback add column if not exists browser text;
alter table beta_feedback add column if not exists screenshot_url text;
alter table beta_feedback add column if not exists fixed_at timestamptz;

-- Editorial preflight checks make story publishing safer during beta.
create table if not exists article_preflight_checks (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  check_key text not null,
  label text not null,
  status text default 'todo',
  notes text,
  checked_by text,
  checked_at timestamptz,
  created_at timestamptz default now(),
  unique(article_id, check_key)
);

create index if not exists idx_launch_checklist_status on launch_checklist(status);
create index if not exists idx_launch_checklist_blocking on launch_checklist(blocking);
create index if not exists idx_beta_feedback_status on beta_feedback(status);
create index if not exists idx_beta_feedback_created_at on beta_feedback(created_at desc);
create index if not exists idx_beta_test_sessions_status on beta_test_sessions(status);
create index if not exists idx_article_preflight_article on article_preflight_checks(article_id);

-- Seed a practical beta checklist. These inserts are safe to rerun.
insert into launch_checklist (area, item, title, notes, status, priority, blocking)
select 'Publishing', 'Publish 8 real local stories', 'Publish 8 real local stories', 'Homepage should not feel empty when beta readers arrive.', 'todo', 100, true
where not exists (select 1 from launch_checklist where item = 'Publish 8 real local stories');

insert into launch_checklist (area, item, title, notes, status, priority, blocking)
select 'Mobile', 'Complete mobile homepage and article pass', 'Complete mobile homepage and article pass', 'Check iPhone Safari, Android Chrome and small-screen menus.', 'todo', 95, true
where not exists (select 1 from launch_checklist where item = 'Complete mobile homepage and article pass');

insert into launch_checklist (area, item, title, notes, status, priority, blocking)
select 'Submissions', 'Verify all public submission forms', 'Verify all public submission forms', 'Tips, photos, letters, events, notices, obituaries and beta feedback should land in Supabase.', 'todo', 90, true
where not exists (select 1 from launch_checklist where item = 'Verify all public submission forms');

insert into launch_checklist (area, item, title, notes, status, priority, blocking)
select 'Google News', 'Validate RSS, sitemap and news sitemap URLs', 'Validate RSS, sitemap and news sitemap URLs', 'Confirm NEXT_PUBLIC_SITE_URL is set correctly before indexing.', 'todo', 85, true
where not exists (select 1 from launch_checklist where item = 'Validate RSS, sitemap and news sitemap URLs');

insert into launch_checklist (area, item, title, notes, status, priority, blocking)
select 'Admin', 'Confirm editor/admin role access', 'Confirm editor/admin role access', 'Make sure only trusted accounts can access admin workflows.', 'todo', 80, true
where not exists (select 1 from launch_checklist where item = 'Confirm editor/admin role access');

insert into launch_checklist (area, item, title, notes, status, priority, blocking)
select 'Revenue', 'Test ad placements and advertiser request flow', 'Test ad placements and advertiser request flow', 'Confirm ads render, expire cleanly and inquiries are visible to admin.', 'todo', 65, false
where not exists (select 1 from launch_checklist where item = 'Test ad placements and advertiser request flow');

insert into launch_checklist (area, item, title, notes, status, priority, blocking)
select 'Audience', 'Test newsletter signup and export', 'Test newsletter signup and export', 'Confirm signup source, status and CSV export for audience list.', 'todo', 60, false
where not exists (select 1 from launch_checklist where item = 'Test newsletter signup and export');
