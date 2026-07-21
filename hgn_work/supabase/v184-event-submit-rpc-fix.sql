-- HGN v184 - Event Submit RPC Fix
-- Fixes RLS insert failure for event_submissions.
-- Public submit uses SECURITY DEFINER RPC.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  event_date date,
  start_time text,
  end_time text,
  location text,
  community text,
  organizer_name text,
  organizer_email text,
  organizer_phone text,
  status text not null default 'pending',
  admin_notes text,
  published_event_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_submissions add column if not exists title text;
alter table public.event_submissions add column if not exists description text;
alter table public.event_submissions add column if not exists event_date date;
alter table public.event_submissions add column if not exists start_time text;
alter table public.event_submissions add column if not exists end_time text;
alter table public.event_submissions add column if not exists location text;
alter table public.event_submissions add column if not exists community text;
alter table public.event_submissions add column if not exists organizer_name text;
alter table public.event_submissions add column if not exists organizer_email text;
alter table public.event_submissions add column if not exists organizer_phone text;
alter table public.event_submissions add column if not exists status text default 'pending';
alter table public.event_submissions add column if not exists admin_notes text;
alter table public.event_submissions add column if not exists published_event_id uuid;
alter table public.event_submissions add column if not exists created_at timestamptz default now();
alter table public.event_submissions add column if not exists updated_at timestamptz default now();

alter table public.event_submissions enable row level security;

create or replace function public.submit_community_event(
  p_title text,
  p_description text,
  p_event_date date,
  p_start_time text,
  p_end_time text,
  p_location text,
  p_community text,
  p_organizer_name text,
  p_organizer_email text,
  p_organizer_phone text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'Event title is required.';
  end if;

  if p_description is null or length(trim(p_description)) = 0 then
    raise exception 'Event description is required.';
  end if;

  if p_event_date is null then
    raise exception 'Event date is required.';
  end if;

  insert into public.event_submissions (
    title, description, event_date, start_time, end_time, location, community,
    organizer_name, organizer_email, organizer_phone, status, created_at, updated_at
  )
  values (
    trim(p_title),
    trim(p_description),
    p_event_date,
    nullif(trim(coalesce(p_start_time, '')), ''),
    nullif(trim(coalesce(p_end_time, '')), ''),
    nullif(trim(coalesce(p_location, '')), ''),
    nullif(trim(coalesce(p_community, '')), ''),
    nullif(trim(coalesce(p_organizer_name, '')), ''),
    nullif(trim(coalesce(p_organizer_email, '')), ''),
    nullif(trim(coalesce(p_organizer_phone, '')), ''),
    'pending',
    now(),
    now()
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_community_event(text, text, date, text, text, text, text, text, text, text) from public;
grant execute on function public.submit_community_event(text, text, date, text, text, text, text, text, text, text) to anon;
grant execute on function public.submit_community_event(text, text, date, text, text, text, text, text, text, text) to authenticated;

drop policy if exists "event_submissions_public_insert" on public.event_submissions;
drop policy if exists event_submissions_public_insert on public.event_submissions;
create policy "event_submissions_public_insert"
on public.event_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "event_submissions_authenticated_manage" on public.event_submissions;
drop policy if exists event_submissions_authenticated_manage on public.event_submissions;
create policy "event_submissions_authenticated_manage"
on public.event_submissions
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_event_submissions_status_date
on public.event_submissions (status, event_date, created_at desc);
