-- HGN v146 - Alert Reliability + Schema Guard
-- Defensive migration designed for existing/partial v143-v145 installs.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.submission_alert_schema_repairs (
  id uuid primary key default gen_random_uuid(),
  repair_key text not null,
  repair_label text not null,
  status text not null default 'complete',
  notes text,
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.submission_alert_settings') is null then
    create table public.submission_alert_settings (
      id uuid primary key default gen_random_uuid(),
      alert_key text not null default 'letters_to_editor_alert',
      alert_label text not null default 'Letters to the Editor alert',
      alert_name text,
      alert_type text default 'email',
      channel text default 'email',
      submission_type text default 'letter_to_editor',
      source_table text default 'letters_to_editor',
      destination_email text,
      destination_phone text,
      email_enabled boolean default true,
      sms_enabled boolean default false,
      status text default 'active',
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  end if;

  alter table public.submission_alert_settings add column if not exists alert_key text;
  alter table public.submission_alert_settings add column if not exists alert_label text;
  alter table public.submission_alert_settings add column if not exists alert_name text;
  alter table public.submission_alert_settings add column if not exists alert_type text;
  alter table public.submission_alert_settings add column if not exists channel text;
  alter table public.submission_alert_settings add column if not exists submission_type text;
  alter table public.submission_alert_settings add column if not exists source_table text;
  alter table public.submission_alert_settings add column if not exists destination_email text;
  alter table public.submission_alert_settings add column if not exists destination_phone text;
  alter table public.submission_alert_settings add column if not exists email_enabled boolean default true;
  alter table public.submission_alert_settings add column if not exists sms_enabled boolean default false;
  alter table public.submission_alert_settings add column if not exists status text default 'active';
  alter table public.submission_alert_settings add column if not exists created_at timestamptz default now();
  alter table public.submission_alert_settings add column if not exists updated_at timestamptz default now();

  update public.submission_alert_settings
     set alert_key = coalesce(alert_key, 'letters_to_editor_alert'),
         alert_label = coalesce(alert_label, 'Letters to the Editor alert'),
         alert_name = coalesce(alert_name, alert_label, 'Letters to the Editor alert'),
         alert_type = coalesce(alert_type, channel, 'email'),
         channel = coalesce(channel, alert_type, 'email'),
         submission_type = coalesce(submission_type, 'letter_to_editor'),
         source_table = coalesce(source_table, 'letters_to_editor'),
         email_enabled = coalesce(email_enabled, true),
         sms_enabled = coalesce(sms_enabled, false),
         status = coalesce(status, 'active'),
         updated_at = now()
   where alert_key is null
      or alert_label is null
      or alert_name is null
      or alert_type is null
      or channel is null
      or submission_type is null
      or source_table is null
      or email_enabled is null
      or sms_enabled is null
      or status is null;

  alter table public.submission_alert_settings alter column alert_key set default 'letters_to_editor_alert';
  alter table public.submission_alert_settings alter column alert_label set default 'Letters to the Editor alert';
  alter table public.submission_alert_settings alter column alert_type set default 'email';
  alter table public.submission_alert_settings alter column channel set default 'email';
  alter table public.submission_alert_settings alter column submission_type set default 'letter_to_editor';
  alter table public.submission_alert_settings alter column source_table set default 'letters_to_editor';
  alter table public.submission_alert_settings alter column email_enabled set default true;
  alter table public.submission_alert_settings alter column sms_enabled set default false;
  alter table public.submission_alert_settings alter column status set default 'active';

  alter table public.submission_alert_settings alter column alert_key set not null;
  alter table public.submission_alert_settings alter column alert_label set not null;

  if not exists (
    select 1 from public.submission_alert_settings
    where alert_key = 'letters_to_editor_alert'
  ) then
    insert into public.submission_alert_settings (
      alert_key,
      alert_label,
      alert_name,
      alert_type,
      channel,
      submission_type,
      source_table,
      email_enabled,
      sms_enabled,
      status,
      created_at,
      updated_at
    ) values (
      'letters_to_editor_alert',
      'Letters to the Editor alert',
      'Letters to the Editor alert',
      'email',
      'email',
      'letter_to_editor',
      'letters_to_editor',
      true,
      false,
      'active',
      now(),
      now()
    );
  end if;
end $$;

create table if not exists public.submission_alert_delivery_checks (
  id uuid primary key default gen_random_uuid(),
  check_key text not null,
  check_label text not null,
  status text not null default 'pending',
  channel text not null default 'email',
  last_result text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.submission_alert_delivery_checks (check_key, check_label, status, channel)
select 'letters_to_editor_email_path', 'Letters to the Editor email alert path', 'pending', 'email'
where not exists (
  select 1 from public.submission_alert_delivery_checks
  where check_key = 'letters_to_editor_email_path'
);

insert into public.submission_alert_delivery_checks (check_key, check_label, status, channel)
select 'letters_to_editor_phone_path', 'Optional phone alert path', 'optional', 'sms'
where not exists (
  select 1 from public.submission_alert_delivery_checks
  where check_key = 'letters_to_editor_phone_path'
);

insert into public.submission_alert_schema_repairs (repair_key, repair_label, status, notes)
select 'v146_alert_shape_guard', 'v146 alert settings schema guard', 'complete', 'Ensures legacy alert_key and alert_label requirements are satisfied before inserts.'
where not exists (
  select 1 from public.submission_alert_schema_repairs
  where repair_key = 'v146_alert_shape_guard'
);
