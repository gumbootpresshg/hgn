-- HGN v165 - Submission Queue Split
-- Keeps marketplace/job mirrored rows from showing in Reader submissions.
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.submission_inbox add column if not exists submission_type text;
alter table public.submission_inbox add column if not exists status text default 'pending';
alter table public.submission_inbox add column if not exists updated_at timestamptz default now();

-- Normalize common submission types so the admin page can separate queues correctly.
update public.submission_inbox
set submission_type = 'classified'
where submission_type is null
  and (
    payload ->> 'source_table' = 'classifieds'
    or payload ? 'classified_id'
    or lower(coalesce(title, '')) like '%classified%'
  );

update public.submission_inbox
set submission_type = 'job'
where submission_type is null
  and (
    payload ? 'job_title'
    or lower(coalesce(title, '')) like '%job%'
  );

update public.submission_inbox
set submission_type = 'letter_to_editor'
where submission_type is null
  and (
    lower(coalesce(title, '')) like '%letter%'
    or lower(coalesce(message, '')) like '%letter to the editor%'
  );

update public.submission_inbox
set submission_type = 'reader_submission'
where submission_type is null;

create index if not exists idx_submission_inbox_type_status_created
on public.submission_inbox (submission_type, status, created_at desc);
