-- HGN v173 - Letters Legacy letter Column Fix
-- Fixes: null value in column "letter" of relation "letters_to_editor" violates not-null constraint.
-- Safe to rerun.

create extension if not exists pgcrypto;

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
  letter text,
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

alter table public.letters_to_editor add column if not exists submission_id uuid;
alter table public.letters_to_editor add column if not exists name text;
alter table public.letters_to_editor add column if not exists email text;
alter table public.letters_to_editor add column if not exists phone text;
alter table public.letters_to_editor add column if not exists community text;
alter table public.letters_to_editor add column if not exists location text;
alter table public.letters_to_editor add column if not exists subject text;
alter table public.letters_to_editor add column if not exists message text;
alter table public.letters_to_editor add column if not exists body text;
alter table public.letters_to_editor add column if not exists letter text;
alter table public.letters_to_editor add column if not exists edited_subject text;
alter table public.letters_to_editor add column if not exists edited_body text;
alter table public.letters_to_editor add column if not exists status text default 'approved';
alter table public.letters_to_editor add column if not exists source text default 'editor';
alter table public.letters_to_editor add column if not exists published_at timestamptz;
alter table public.letters_to_editor add column if not exists edited_at timestamptz;
alter table public.letters_to_editor add column if not exists editor_notes text;
alter table public.letters_to_editor add column if not exists created_at timestamptz default now();
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

update public.letters_to_editor
set letter = coalesce(
  nullif(letter, ''),
  nullif(edited_body, ''),
  nullif(body, ''),
  nullif(message, ''),
  'Letter text unavailable.'
)
where letter is null or letter = '';

update public.letters_to_editor
set body = coalesce(nullif(body, ''), letter),
    message = coalesce(nullif(message, ''), letter),
    edited_body = coalesce(nullif(edited_body, ''), letter),
    edited_subject = coalesce(nullif(edited_subject, ''), nullif(subject, ''), 'Letter to the Editor')
where body is null
   or body = ''
   or message is null
   or message = ''
   or edited_body is null
   or edited_body = ''
   or edited_subject is null
   or edited_subject = '';

alter table public.letters_to_editor
  alter column letter set default 'Letter text unavailable.';

create index if not exists idx_letters_to_editor_submission_id
on public.letters_to_editor (submission_id)
where submission_id is not null;

create index if not exists idx_letters_to_editor_status_published
on public.letters_to_editor (status, published_at desc, created_at desc);

alter table public.letters_to_editor enable row level security;

drop policy if exists "letters_public_read_published" on public.letters_to_editor;
drop policy if exists letters_public_read_published on public.letters_to_editor;
create policy "letters_public_read_published"
on public.letters_to_editor
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "letters_authenticated_moderate" on public.letters_to_editor;
drop policy if exists letters_authenticated_moderate on public.letters_to_editor;
create policy "letters_authenticated_moderate"
on public.letters_to_editor
for all
to authenticated
using (true)
with check (true);
