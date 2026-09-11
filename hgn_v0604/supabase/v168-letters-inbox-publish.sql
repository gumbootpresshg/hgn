-- HGN v168 - Letters Inbox Publish Workflow
-- Public submits only to submission_inbox. Editor publishes to letters_to_editor.
-- This avoids public RLS insert errors on letters_to_editor.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.submission_inbox (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null,
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

alter table public.submission_inbox add column if not exists submission_type text;
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

alter table public.letters_to_editor add column if not exists submission_id uuid;
alter table public.letters_to_editor add column if not exists name text;
alter table public.letters_to_editor add column if not exists email text;
alter table public.letters_to_editor add column if not exists phone text;
alter table public.letters_to_editor add column if not exists community text;
alter table public.letters_to_editor add column if not exists location text;
alter table public.letters_to_editor add column if not exists subject text;
alter table public.letters_to_editor add column if not exists message text;
alter table public.letters_to_editor add column if not exists body text;
alter table public.letters_to_editor add column if not exists edited_subject text;
alter table public.letters_to_editor add column if not exists edited_body text;
alter table public.letters_to_editor add column if not exists status text default 'approved';
alter table public.letters_to_editor add column if not exists source text default 'editor';
alter table public.letters_to_editor add column if not exists published_at timestamptz;
alter table public.letters_to_editor add column if not exists edited_at timestamptz;
alter table public.letters_to_editor add column if not exists editor_notes text;
alter table public.letters_to_editor add column if not exists created_at timestamptz default now();
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

update public.submission_inbox
set community = coalesce(
  nullif(community, ''),
  nullif(payload ->> 'community', ''),
  nullif(payload ->> 'location', ''),
  'Community not provided'
)
where submission_type = 'letter_to_editor'
  and (community is null or community = '');

alter table public.submission_inbox enable row level security;
alter table public.letters_to_editor enable row level security;

-- Public can submit to inbox only.
drop policy if exists "submission_inbox_public_insert" on public.submission_inbox;
drop policy if exists submission_inbox_public_insert on public.submission_inbox;
drop policy if exists "public_insert_submission_inbox" on public.submission_inbox;
drop policy if exists public_insert_submission_inbox on public.submission_inbox;

create policy "submission_inbox_public_insert"
on public.submission_inbox
for insert
to anon, authenticated
with check (
  submission_type <> 'letter_to_editor'
  or (
    community is not null
    and length(trim(community)) > 0
  )
);

drop policy if exists "submission_inbox_authenticated_review" on public.submission_inbox;
drop policy if exists submission_inbox_authenticated_review on public.submission_inbox;

create policy "submission_inbox_authenticated_review"
on public.submission_inbox
for all
to authenticated
using (true)
with check (true);

-- Public can read approved published letters only.
drop policy if exists "letters_public_insert" on public.letters_to_editor;
drop policy if exists letters_public_insert on public.letters_to_editor;
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

create unique index if not exists idx_letters_to_editor_submission_id_unique
on public.letters_to_editor (submission_id)
where submission_id is not null;

create index if not exists idx_submission_inbox_letters_status_created
on public.submission_inbox (submission_type, status, created_at desc);

create index if not exists idx_letters_to_editor_status_published
on public.letters_to_editor (status, published_at desc, created_at desc);
