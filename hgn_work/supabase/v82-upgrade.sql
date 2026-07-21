-- HGN v82 Accessibility Desk
-- Beta accessibility readiness, public accessibility status, audit checks and remediation tracking.

create extension if not exists pgcrypto;

create table if not exists public.accessibility_audit_checks (
  id uuid primary key default gen_random_uuid(),
  route_path text not null default '/',
  check_area text not null default 'general',
  requirement text not null,
  wcag_ref text,
  status text not null default 'needs-review',
  priority text not null default 'normal',
  owner text,
  notes text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accessibility_audit_checks add column if not exists route_path text not null default '/';
alter table public.accessibility_audit_checks add column if not exists check_area text not null default 'general';
alter table public.accessibility_audit_checks add column if not exists requirement text not null default 'Accessibility check';
alter table public.accessibility_audit_checks add column if not exists wcag_ref text;
alter table public.accessibility_audit_checks add column if not exists status text not null default 'needs-review';
alter table public.accessibility_audit_checks add column if not exists priority text not null default 'normal';
alter table public.accessibility_audit_checks add column if not exists owner text;
alter table public.accessibility_audit_checks add column if not exists notes text;
alter table public.accessibility_audit_checks add column if not exists last_checked_at timestamptz;
alter table public.accessibility_audit_checks add column if not exists created_at timestamptz not null default now();
alter table public.accessibility_audit_checks add column if not exists updated_at timestamptz not null default now();

create table if not exists public.accessibility_remediation_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  route_path text,
  issue_type text not null default 'accessibility',
  status text not null default 'open',
  priority text not null default 'normal',
  owner text,
  due_date date,
  fix_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accessibility_remediation_tasks add column if not exists title text not null default 'Accessibility task';
alter table public.accessibility_remediation_tasks add column if not exists route_path text;
alter table public.accessibility_remediation_tasks add column if not exists issue_type text not null default 'accessibility';
alter table public.accessibility_remediation_tasks add column if not exists status text not null default 'open';
alter table public.accessibility_remediation_tasks add column if not exists priority text not null default 'normal';
alter table public.accessibility_remediation_tasks add column if not exists owner text;
alter table public.accessibility_remediation_tasks add column if not exists due_date date;
alter table public.accessibility_remediation_tasks add column if not exists fix_notes text;
alter table public.accessibility_remediation_tasks add column if not exists resolved_at timestamptz;
alter table public.accessibility_remediation_tasks add column if not exists created_at timestamptz not null default now();
alter table public.accessibility_remediation_tasks add column if not exists updated_at timestamptz not null default now();

create table if not exists public.accessibility_reader_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  route_path text,
  request_type text not null default 'accessibility-help',
  message text not null,
  status text not null default 'new',
  priority text not null default 'normal',
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accessibility_reader_requests add column if not exists name text;
alter table public.accessibility_reader_requests add column if not exists email text;
alter table public.accessibility_reader_requests add column if not exists route_path text;
alter table public.accessibility_reader_requests add column if not exists request_type text not null default 'accessibility-help';
alter table public.accessibility_reader_requests add column if not exists message text not null default 'Reader accessibility request';
alter table public.accessibility_reader_requests add column if not exists status text not null default 'new';
alter table public.accessibility_reader_requests add column if not exists priority text not null default 'normal';
alter table public.accessibility_reader_requests add column if not exists admin_notes text;
alter table public.accessibility_reader_requests add column if not exists resolved_at timestamptz;
alter table public.accessibility_reader_requests add column if not exists created_at timestamptz not null default now();
alter table public.accessibility_reader_requests add column if not exists updated_at timestamptz not null default now();

create index if not exists accessibility_audit_checks_status_idx on public.accessibility_audit_checks(status);
create index if not exists accessibility_audit_checks_route_idx on public.accessibility_audit_checks(route_path);
create index if not exists accessibility_tasks_status_idx on public.accessibility_remediation_tasks(status);
create index if not exists accessibility_reader_requests_status_idx on public.accessibility_reader_requests(status);

insert into public.accessibility_audit_checks (route_path, check_area, requirement, wcag_ref, status, priority, notes)
select '/', 'navigation', 'Keyboard users can reach the main menu, story cards and footer links.', 'WCAG 2.1.1', 'needs-review', 'high', 'Run this on desktop and phone viewport before beta.'
where not exists (select 1 from public.accessibility_audit_checks where route_path = '/' and requirement ilike 'Keyboard users can reach%');

insert into public.accessibility_audit_checks (route_path, check_area, requirement, wcag_ref, status, priority, notes)
select '/articles', 'content', 'Article pages use readable heading order, alt text and sufficient contrast.', 'WCAG 1.1.1 / 1.4.3 / 2.4.6', 'needs-review', 'high', 'Check story template, captions, credits and embedded media.'
where not exists (select 1 from public.accessibility_audit_checks where route_path = '/articles' and requirement ilike 'Article pages use readable%');

insert into public.accessibility_audit_checks (route_path, check_area, requirement, wcag_ref, status, priority, notes)
select '/submit-tip', 'forms', 'Reader submission forms have labels, error clarity and mobile-friendly fields.', 'WCAG 3.3.2', 'needs-review', 'normal', 'Important for community submissions during beta.'
where not exists (select 1 from public.accessibility_audit_checks where route_path = '/submit-tip' and requirement ilike 'Reader submission forms%');

insert into public.accessibility_remediation_tasks (title, route_path, issue_type, status, priority, fix_notes)
select 'Confirm alt text coverage for homepage and article hero images', '/', 'image-alt-text', 'open', 'high', 'Use media metadata and article preflight checks together.'
where not exists (select 1 from public.accessibility_remediation_tasks where title = 'Confirm alt text coverage for homepage and article hero images');
