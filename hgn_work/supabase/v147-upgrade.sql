-- HGN v147 - Submission Alert Inbox Guard
-- Defensive migration for online beta security/submission monitoring.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.submission_alert_inbox_guard (
  id uuid primary key default gen_random_uuid(),
  guard_key text not null,
  guard_label text not null,
  status text not null default 'pending',
  severity text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submission_alert_inbox_guard
  add column if not exists guard_key text;

alter table public.submission_alert_inbox_guard
  add column if not exists guard_label text;

alter table public.submission_alert_inbox_guard
  add column if not exists status text default 'pending';

alter table public.submission_alert_inbox_guard
  add column if not exists severity text default 'normal';

alter table public.submission_alert_inbox_guard
  add column if not exists notes text;

alter table public.submission_alert_inbox_guard
  add column if not exists created_at timestamptz default now();

alter table public.submission_alert_inbox_guard
  add column if not exists updated_at timestamptz default now();

update public.submission_alert_inbox_guard
   set guard_key = coalesce(guard_key, 'letters_private_inbox'),
       guard_label = coalesce(guard_label, 'Letters private inbox guard'),
       status = coalesce(status, 'pending'),
       severity = coalesce(severity, 'normal'),
       updated_at = now()
 where guard_key is null
    or guard_label is null
    or status is null
    or severity is null;

alter table public.submission_alert_inbox_guard
  alter column guard_key set not null;

alter table public.submission_alert_inbox_guard
  alter column guard_label set not null;

insert into public.submission_alert_inbox_guard (guard_key, guard_label, status, severity, notes)
select 'letters_private_inbox', 'Letters private inbox guard', 'ready', 'high',
       'Public users should insert letters only. Admin/editor can review privately.'
where not exists (
  select 1 from public.submission_alert_inbox_guard
  where guard_key = 'letters_private_inbox'
);

insert into public.submission_alert_inbox_guard (guard_key, guard_label, status, severity, notes)
select 'email_alert_smoke_test', 'Email alert smoke test', 'pending', 'high',
       'Submit one test letter and confirm the notification reaches the right inbox.'
where not exists (
  select 1 from public.submission_alert_inbox_guard
  where guard_key = 'email_alert_smoke_test'
);

insert into public.submission_alert_inbox_guard (guard_key, guard_label, status, severity, notes)
select 'phone_alert_optional', 'Phone alert optional check', 'optional', 'normal',
       'Only enable phone/SMS after email alerts are reliable.'
where not exists (
  select 1 from public.submission_alert_inbox_guard
  where guard_key = 'phone_alert_optional'
);

insert into public.submission_alert_inbox_guard (guard_key, guard_label, status, severity, notes)
select 'spam_rate_limit_check', 'Spam and rate-limit check', 'pending', 'high',
       'Confirm public submission routes have honeypot and basic throttling before online beta.'
where not exists (
  select 1 from public.submission_alert_inbox_guard
  where guard_key = 'spam_rate_limit_check'
);
