-- HGN v170 - Letter Submit RPC Fix
-- Fixes persistent RLS insert failures on submission_inbox.
-- Public submit calls a SECURITY DEFINER function.
-- Public still cannot read submission_inbox.
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

alter table public.submission_inbox enable row level security;

-- Public submit function. It validates required fields and inserts as function owner.
create or replace function public.submit_letter_to_editor(
  p_name text,
  p_email text,
  p_phone text,
  p_community text,
  p_subject text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Name is required.';
  end if;

  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Email is required.';
  end if;

  if p_community is null or length(trim(p_community)) = 0 then
    raise exception 'Community is required.';
  end if;

  if p_message is null or length(trim(p_message)) = 0 then
    raise exception 'Letter is required.';
  end if;

  insert into public.submission_inbox (
    submission_type,
    title,
    sender_name,
    sender_email,
    sender_phone,
    community,
    message,
    payload,
    status,
    priority,
    created_at,
    updated_at
  )
  values (
    'letter_to_editor',
    coalesce(nullif(trim(p_subject), ''), 'Letter to the Editor'),
    trim(p_name),
    trim(p_email),
    nullif(trim(coalesce(p_phone, '')), ''),
    trim(p_community),
    trim(p_message),
    jsonb_build_object(
      'community', trim(p_community),
      'location', trim(p_community),
      'source', 'submit-letter-rpc'
    ),
    'pending',
    'normal',
    now(),
    now()
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_letter_to_editor(text, text, text, text, text, text) from public;
grant execute on function public.submit_letter_to_editor(text, text, text, text, text, text) to anon;
grant execute on function public.submit_letter_to_editor(text, text, text, text, text, text) to authenticated;

-- Keep public inserts allowed too, but RPC is now the reliable route.
drop policy if exists "submission_inbox_public_insert" on public.submission_inbox;
drop policy if exists submission_inbox_public_insert on public.submission_inbox;
create policy "submission_inbox_public_insert"
on public.submission_inbox
for insert
to anon, authenticated
with check (true);

drop policy if exists "submission_inbox_authenticated_review" on public.submission_inbox;
drop policy if exists submission_inbox_authenticated_review on public.submission_inbox;
create policy "submission_inbox_authenticated_review"
on public.submission_inbox
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_submission_inbox_type_status_created
on public.submission_inbox (submission_type, status, created_at desc);

-- Published letters table remains editor-controlled.
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
