-- HGN v144 - Security hardening pass
-- Defensive migration for online beta security checks and alert protection.

create table if not exists public.security_hardening_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_area text not null default 'general',
  status text not null default 'needs_review',
  severity text not null default 'medium',
  notes text,
  owner text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.security_hardening_checks add column if not exists check_title text;
alter table public.security_hardening_checks add column if not exists check_area text default 'general';
alter table public.security_hardening_checks add column if not exists status text default 'needs_review';
alter table public.security_hardening_checks add column if not exists severity text default 'medium';
alter table public.security_hardening_checks add column if not exists notes text;
alter table public.security_hardening_checks add column if not exists owner text default 'Admin / Editor';
alter table public.security_hardening_checks add column if not exists created_at timestamptz default now();
alter table public.security_hardening_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.submission_alert_settings (
  id uuid primary key default gen_random_uuid(),
  alert_name text not null unique,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  recipient_email text,
  recipient_phone text,
  alert_type text not null default 'letter_to_editor',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submission_alert_settings add column if not exists alert_name text;
alter table public.submission_alert_settings add column if not exists email_enabled boolean default true;
alter table public.submission_alert_settings add column if not exists sms_enabled boolean default false;
alter table public.submission_alert_settings add column if not exists recipient_email text;
alter table public.submission_alert_settings add column if not exists recipient_phone text;
alter table public.submission_alert_settings add column if not exists alert_type text default 'letter_to_editor';
alter table public.submission_alert_settings add column if not exists status text default 'active';
alter table public.submission_alert_settings add column if not exists created_at timestamptz default now();
alter table public.submission_alert_settings add column if not exists updated_at timestamptz default now();

create table if not exists public.security_event_log (
  id uuid primary key default gen_random_uuid(),
  event_title text not null,
  event_type text not null default 'security_check',
  severity text not null default 'info',
  status text not null default 'open',
  source_route text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.security_event_log add column if not exists event_title text;
alter table public.security_event_log add column if not exists event_type text default 'security_check';
alter table public.security_event_log add column if not exists severity text default 'info';
alter table public.security_event_log add column if not exists status text default 'open';
alter table public.security_event_log add column if not exists source_route text;
alter table public.security_event_log add column if not exists notes text;
alter table public.security_event_log add column if not exists created_at timestamptz default now();

alter table public.security_hardening_checks enable row level security;
alter table public.submission_alert_settings enable row level security;
alter table public.security_event_log enable row level security;

create index if not exists security_hardening_checks_status_idx on public.security_hardening_checks(status);
create index if not exists security_hardening_checks_area_idx on public.security_hardening_checks(check_area);
create index if not exists submission_alert_settings_type_idx on public.submission_alert_settings(alert_type);
create index if not exists security_event_log_type_idx on public.security_event_log(event_type);

insert into public.security_hardening_checks (check_title, check_area, status, severity, notes, owner)
select item.check_title, item.check_area, item.status, item.severity, item.notes, item.owner
from (values
  ('Admin routes require login', 'admin', 'required_before_upload', 'high', 'Confirm every admin route redirects unauthenticated visitors.', 'Admin / Editor'),
  ('Letters to editor are insert-only for public users', 'submissions', 'ready', 'high', 'Public users should not be able to read the protected submission inbox.', 'Admin / Editor'),
  ('Service role key is server-only', 'deployment', 'required_before_upload', 'critical', 'Never expose service role keys in client-side code or public environment variables.', 'Admin / Editor'),
  ('Alert logs are protected', 'alerts', 'needs_review', 'medium', 'Only admin/editor users should read submission alert delivery logs.', 'Admin / Editor')
) as item(check_title, check_area, status, severity, notes, owner)
where not exists (
  select 1 from public.security_hardening_checks existing
  where existing.check_title = item.check_title
);

insert into public.submission_alert_settings (alert_name, email_enabled, sms_enabled, alert_type, status)
select 'Letters to the Editor alert', true, false, 'letter_to_editor', 'active'
where not exists (
  select 1 from public.submission_alert_settings existing
  where existing.alert_name = 'Letters to the Editor alert'
);

insert into public.security_event_log (event_title, event_type, severity, status, source_route, notes)
select 'v144 security hardening migration installed', 'migration', 'info', 'closed', 'supabase/v144-upgrade.sql', 'Security hardening tables and alert settings are available.'
where not exists (
  select 1 from public.security_event_log existing
  where existing.event_title = 'v144 security hardening migration installed'
);
