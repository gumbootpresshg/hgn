-- HGN v166 - Letters to the Editor RLS Direct Fix
-- Fixes: new row violates row-level security policy for table "letters_to_editor"
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  location text,
  subject text,
  message text,
  body text,
  status text not null default 'pending',
  source text default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.letters_to_editor add column if not exists name text;
alter table public.letters_to_editor add column if not exists email text;
alter table public.letters_to_editor add column if not exists phone text;
alter table public.letters_to_editor add column if not exists location text;
alter table public.letters_to_editor add column if not exists subject text;
alter table public.letters_to_editor add column if not exists message text;
alter table public.letters_to_editor add column if not exists body text;
alter table public.letters_to_editor add column if not exists status text default 'pending';
alter table public.letters_to_editor add column if not exists source text default 'website';
alter table public.letters_to_editor add column if not exists created_at timestamptz default now();
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

create table if not exists public.submission_inbox (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null,
  title text,
  sender_name text,
  sender_email text,
  sender_phone text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  priority text not null default 'normal',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submission_inbox add column if not exists submission_type text;
alter table public.submission_inbox add column if not exists title text;
alter table public.submission_inbox add column if not exists sender_name text;
alter table public.submission_inbox add column if not exists sender_email text;
alter table public.submission_inbox add column if not exists sender_phone text;
alter table public.submission_inbox add column if not exists message text;
alter table public.submission_inbox add column if not exists payload jsonb default '{}'::jsonb;
alter table public.submission_inbox add column if not exists status text default 'pending';
alter table public.submission_inbox add column if not exists priority text default 'normal';
alter table public.submission_inbox add column if not exists admin_notes text;
alter table public.submission_inbox add column if not exists created_at timestamptz default now();
alter table public.submission_inbox add column if not exists updated_at timestamptz default now();

alter table public.letters_to_editor enable row level security;
alter table public.submission_inbox enable row level security;

-- Remove earlier potentially conflicting/partial policy names.
drop policy if exists "public_insert_letters_to_editor" on public.letters_to_editor;
drop policy if exists public_insert_letters_to_editor on public.letters_to_editor;
drop policy if exists "letters_public_insert" on public.letters_to_editor;
drop policy if exists letters_public_insert on public.letters_to_editor;
drop policy if exists "authenticated_review_letters_to_editor" on public.letters_to_editor;
drop policy if exists authenticated_review_letters_to_editor on public.letters_to_editor;
drop policy if exists "authenticated_moderate_letters_to_editor" on public.letters_to_editor;
drop policy if exists authenticated_moderate_letters_to_editor on public.letters_to_editor;

create policy "letters_public_insert"
on public.letters_to_editor
for insert
to anon, authenticated
with check (true);

create policy "letters_authenticated_review"
on public.letters_to_editor
for all
to authenticated
using (true)
with check (true);

drop policy if exists "submission_inbox_public_insert" on public.submission_inbox;
drop policy if exists submission_inbox_public_insert on public.submission_inbox;
drop policy if exists "public_insert_submission_inbox" on public.submission_inbox;
drop policy if exists public_insert_submission_inbox on public.submission_inbox;
drop policy if exists "submission_inbox_authenticated_review" on public.submission_inbox;
drop policy if exists submission_inbox_authenticated_review on public.submission_inbox;

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

create index if not exists idx_letters_to_editor_status_created
on public.letters_to_editor (status, created_at desc);

create index if not exists idx_submission_inbox_type_status_created
on public.submission_inbox (submission_type, status, created_at desc);
