-- v145 submission alert settings legacy-column repair
-- Fixes missing NOT NULL values for alert_key and alert_label.
-- Safe to run after failed v144/v145 attempts.

do $$
begin
  if to_regclass('public.submission_alert_settings') is not null then
    alter table public.submission_alert_settings
      add column if not exists alert_key text;

    alter table public.submission_alert_settings
      add column if not exists alert_label text;

    alter table public.submission_alert_settings
      add column if not exists alert_name text;

    alter table public.submission_alert_settings
      add column if not exists alert_type text;

    alter table public.submission_alert_settings
      add column if not exists submission_type text;

    alter table public.submission_alert_settings
      add column if not exists source_table text;

    alter table public.submission_alert_settings
      add column if not exists channel text;

    alter table public.submission_alert_settings
      add column if not exists email_enabled boolean default true;

    alter table public.submission_alert_settings
      add column if not exists sms_enabled boolean default false;

    alter table public.submission_alert_settings
      add column if not exists status text default 'active';

    alter table public.submission_alert_settings
      add column if not exists updated_at timestamptz default now();

    update public.submission_alert_settings
       set alert_key = coalesce(alert_key, 'letters_to_editor_alert'),
           alert_label = coalesce(alert_label, 'Letters to the Editor alert'),
           alert_name = coalesce(alert_name, 'Letters to the Editor alert'),
           alert_type = coalesce(alert_type, 'email'),
           channel = coalesce(channel, 'email'),
           submission_type = coalesce(submission_type, 'letter_to_editor'),
           source_table = coalesce(source_table, 'letters_to_editor'),
           email_enabled = coalesce(email_enabled, true),
           sms_enabled = coalesce(sms_enabled, false),
           status = coalesce(status, 'active'),
           updated_at = now()
     where alert_key is null
        or alert_label is null
        or alert_key = 'letters_to_editor_alert'
        or source_table = 'letters_to_editor'
        or submission_type = 'letter_to_editor';

    alter table public.submission_alert_settings
      alter column alert_key set default 'letters_to_editor_alert';

    alter table public.submission_alert_settings
      alter column alert_label set default 'Letters to the Editor alert';

    alter table public.submission_alert_settings
      alter column alert_key set not null;

    alter table public.submission_alert_settings
      alter column alert_label set not null;

    if not exists (
      select 1
      from public.submission_alert_settings
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
        now()
      );
    end if;
  end if;
end $$;
