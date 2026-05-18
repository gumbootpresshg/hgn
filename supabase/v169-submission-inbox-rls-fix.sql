-- HGN v169 - Submission Inbox RLS Fix
-- Fixes: new row violates row-level security policy for table "submission_inbox"
-- Public visitors may INSERT submissions only.
-- Public visitors may NOT read the inbox.
-- Authenticated admin/editor users may review/moderate.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.submission_inbox (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null default 'reader_submission',
  title text,
  sender_name text,
  sender_email text,
  sender_phone text,
  community text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  priority text not null default 'normal',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submission_inbox add column if not exists submission_type text default 'reader_submission';
alter table public.submission_inbox add column if not exists title text;
alter table public.submission_inbox add column if not exists sender_name text;
alter table public.submission_inbox add column if not exists sender_email text;
alter table public.submission_inbox add column if not exists sender_phone text;
alter table public.submission_inbox add column if not exists community text;
alter table public.submission_inbox add column if not exists message text;
alter table public.submission_inbox add column if not exists payload jsonb default '{}'::jsonb;
alter table public.submission_inbox add column if not exists status text default 'pending';
alter table public.submission_inbox add column if not exists priority text default 'normal';
alter table public.submission_inbox add column if not exists admin_notes text;
alter table public.submission_inbox add column if not exists created_at timestamptz default now();
alter table public.submission_inbox add column if not exists updated_at timestamptz default now();

update public.submission_inbox
set submission_type = coalesce(nullif(submission_type, ''), 'reader_submission'),
    status = coalesce(nullif(status, ''), 'pending'),
    priority = coalesce(nullif(priority, ''), 'normal'),
    payload = coalesce(payload, '{}'::jsonb),
    updated_at = now()
where submission_type is null
   or submission_type = ''
   or status is null
   or status = ''
   or priority is null
   or priority = ''
   or payload is null;

alter table public.submission_inbox alter column submission_type set default 'reader_submission';
alter table public.submission_inbox alter column status set default 'pending';
alter table public.submission_inbox alter column priority set default 'normal';
alter table public.submission_inbox alter column payload set default '{}'::jsonb;

alter table public.submission_inbox enable row level security;

-- Drop known older policies that may have had stricter WITH CHECK logic.
drop policy if exists "submission_inbox_public_insert" on public.submission_inbox;
drop policy if exists submission_inbox_public_insert on public.submission_inbox;
drop policy if exists "public_insert_submission_inbox" on public.submission_inbox;
drop policy if exists public_insert_submission_inbox on public.submission_inbox;
drop policy if exists "submission_inbox_authenticated_review" on public.submission_inbox;
drop policy if exists submission_inbox_authenticated_review on public.submission_inbox;
drop policy if exists "authenticated_review_submission_inbox" on public.submission_inbox;
drop policy if exists authenticated_review_submission_inbox on public.submission_inbox;
drop policy if exists "authenticated_moderate_submission_inbox" on public.submission_inbox;
drop policy if exists authenticated_moderate_submission_inbox on public.submission_inbox;

-- This is intentionally broad for INSERT only.
-- It does not allow public SELECT/UPDATE/DELETE.
create policy "submission_inbox_public_insert"
on public.submission_inbox
for insert
to anon, authenticated
with check (true);

create policy "submission_inbox_authenticated_review"
on public.submission_inbox
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_submission_inbox_type_status_created
on public.submission_inbox (submission_type, status, created_at desc);

-- Make sure published letters table exists, but public submit should not write here.
create table if not exists public.letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid,
  name text,
  email text,
  phone text,
  community text,
  location text,
  subject text,
  message text,
  body text,
  edited_subject text,
  edited_body text,
  status text not null default 'approved',
  source text default 'editor',
  published_at timestamptz,
  edited_at timestamptz,
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.letters_to_editor enable row level security;

drop policy if exists "letters_public_read_published" on public.letters_to_editor;
drop policy if exists letters_public_read_published on public.letters_to_editor;
drop policy if exists "letters_authenticated_moderate" on public.letters_to_editor;
drop policy if exists letters_authenticated_moderate on public.letters_to_editor;

create policy "letters_public_read_published"
on public.letters_to_editor
for select
to anon, authenticated
using (status = 'approved');

create policy "letters_authenticated_moderate"
on public.letters_to_editor
for all
to authenticated
using (true)
with check (true);
