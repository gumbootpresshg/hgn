-- HGN v145 - Submission Shield
-- Defensive migration for Letters to the Editor alerts, form safety, and admin/editor privacy.

create extension if not exists pgcrypto;

create table if not exists public.submission_security_checks (
  id uuid primary key default gen_random_uuid(),
  check_key text not null,
  check_title text not null,
  check_area text not null default 'Submissions',
  status text not null default 'needs_review',
  priority text not null default 'medium',
  notes text,
  owner_label text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submission_security_checks add column if not exists check_key text;
alter table public.submission_security_checks add column if not exists check_title text;
alter table public.submission_security_checks add column if not exists check_area text default 'Submissions';
alter table public.submission_security_checks add column if not exists status text default 'needs_review';
alter table public.submission_security_checks add column if not exists priority text default 'medium';
alter table public.submission_security_checks add column if not exists notes text;
alter table public.submission_security_checks add column if not exists owner_label text default 'Admin / Editor';
alter table public.submission_security_checks add column if not exists created_at timestamptz default now();
alter table public.submission_security_checks add column if not exists updated_at timestamptz default now();

update public.submission_security_checks
   set check_key = 'submission_check_' || left(md5(coalesce(id::text, now()::text)), 12)
 where check_key is null;

alter table public.submission_security_checks alter column check_key set not null;
alter table public.submission_security_checks alter column check_title set not null;
alter table public.submission_security_checks alter column check_area set not null;
alter table public.submission_security_checks alter column status set not null;
alter table public.submission_security_checks alter column priority set not null;

create unique index if not exists submission_security_checks_check_key_uidx
  on public.submission_security_checks (check_key);

create table if not exists public.submission_alert_delivery_tests (
  id uuid primary key default gen_random_uuid(),
  test_key text not null,
  alert_key text not null default 'letters_to_editor_alert',
  channel text not null default 'email',
  status text not null default 'not_tested',
  recipient_hint text,
  last_tested_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submission_alert_delivery_tests add column if not exists test_key text;
alter table public.submission_alert_delivery_tests add column if not exists alert_key text default 'letters_to_editor_alert';
alter table public.submission_alert_delivery_tests add column if not exists channel text default 'email';
alter table public.submission_alert_delivery_tests add column if not exists status text default 'not_tested';
alter table public.submission_alert_delivery_tests add column if not exists recipient_hint text;
alter table public.submission_alert_delivery_tests add column if not exists last_tested_at timestamptz;
alter table public.submission_alert_delivery_tests add column if not exists notes text;
alter table public.submission_alert_delivery_tests add column if not exists created_at timestamptz default now();
alter table public.submission_alert_delivery_tests add column if not exists updated_at timestamptz default now();

update public.submission_alert_delivery_tests
   set test_key = 'alert_test_' || left(md5(coalesce(id::text, now()::text)), 12)
 where test_key is null;

alter table public.submission_alert_delivery_tests alter column test_key set not null;
alter table public.submission_alert_delivery_tests alter column alert_key set not null;
alter table public.submission_alert_delivery_tests alter column channel set not null;
alter table public.submission_alert_delivery_tests alter column status set not null;

create unique index if not exists submission_alert_delivery_tests_test_key_uidx
  on public.submission_alert_delivery_tests (test_key);

-- Repair/normalize v143-v144 alert settings if that table already exists.
do $$
begin
  if to_regclass('public.submission_alert_settings') is not null then
    alter table public.submission_alert_settings add column if not exists alert_key text;
    alter table public.submission_alert_settings add column if not exists alert_name text;
    alter table public.submission_alert_settings add column if not exists submission_type text;
    alter table public.submission_alert_settings add column if not exists source_table text;
    alter table public.submission_alert_settings add column if not exists email_enabled boolean default true;
    alter table public.submission_alert_settings add column if not exists sms_enabled boolean default false;
    alter table public.submission_alert_settings add column if not exists status text default 'active';
    alter table public.submission_alert_settings add column if not exists updated_at timestamptz default now();

    update public.submission_alert_settings
       set alert_key = coalesce(
         alert_key,
         case
           when submission_type = 'letter_to_editor' then 'letters_to_editor_alert'
           when source_table = 'letters_to_editor' then 'letters_to_editor_alert'
           else 'submission_alert_' || left(md5(coalesce(id::text, now()::text)), 12)
         end
       )
     where alert_key is null;

    alter table public.submission_alert_settings alter column alert_key set default 'letters_to_editor_alert';
    alter table public.submission_alert_settings alter column alert_key set not null;

    if not exists (select 1 from public.submission_alert_settings where alert_key = 'letters_to_editor_alert') then
      insert into public.submission_alert_settings (
        alert_key, alert_name, submission_type, source_table, email_enabled, sms_enabled, status, updated_at
      ) values (
        'letters_to_editor_alert', 'Letters to the Editor alert', 'letter_to_editor', 'letters_to_editor', true, false, 'active', now()
      );
    else
      update public.submission_alert_settings
         set alert_name = coalesce(alert_name, 'Letters to the Editor alert'),
             submission_type = coalesce(submission_type, 'letter_to_editor'),
             source_table = coalesce(source_table, 'letters_to_editor'),
             email_enabled = coalesce(email_enabled, true),
             sms_enabled = coalesce(sms_enabled, false),
             status = coalesce(status, 'active'),
             updated_at = now()
       where alert_key = 'letters_to_editor_alert';
    end if;
  end if;
end $$;

insert into public.submission_security_checks (check_key, check_title, check_area, status, priority, notes)
select 'letters_write_only_rls', 'Letters are write-only for public visitors', 'Database', 'blocker', 'high', 'Anonymous visitors should be able to submit a letter but not read submitted rows.'
where not exists (select 1 from public.submission_security_checks where check_key = 'letters_write_only_rls');

insert into public.submission_security_checks (check_key, check_title, check_area, status, priority, notes)
select 'admin_editor_private_inbox', 'Letter inbox is admin/editor only', 'Letters', 'blocker', 'high', 'Protect sender names, emails, phone numbers, letter drafts, and moderation notes.'
where not exists (select 1 from public.submission_security_checks where check_key = 'admin_editor_private_inbox');

insert into public.submission_security_checks (check_key, check_title, check_area, status, priority, notes)
select 'form_spam_tripwires', 'Spam tripwires are enabled', 'Forms', 'needs_review', 'medium', 'Keep honeypot, basic rate limits, repeated email checks, and submit timing checks active.'
where not exists (select 1 from public.submission_security_checks where check_key = 'form_spam_tripwires');

insert into public.submission_alert_delivery_tests (test_key, alert_key, channel, status, notes)
select 'letters_email_alert_test', 'letters_to_editor_alert', 'email', 'not_tested', 'Send one test Letter to the Editor and confirm the admin/editor email alert arrives.'
where not exists (select 1 from public.submission_alert_delivery_tests where test_key = 'letters_email_alert_test');

insert into public.submission_alert_delivery_tests (test_key, alert_key, channel, status, notes)
select 'letters_phone_alert_test', 'letters_to_editor_alert', 'phone_or_sms', 'optional', 'Only enable after email alerts are stable. Use Twilio or carrier email-to-SMS later if needed.'
where not exists (select 1 from public.submission_alert_delivery_tests where test_key = 'letters_phone_alert_test');

alter table public.submission_security_checks enable row level security;
alter table public.submission_alert_delivery_tests enable row level security;
