-- HGN v183 - Editorial Dates + Event Approval Queue + Ask Annie Pause
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

create table if not exists public.events (
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
  status text not null default 'published',
  source text default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events add column if not exists title text;
alter table public.events add column if not exists description text;
alter table public.events add column if not exists event_date date;
alter table public.events add column if not exists start_time text;
alter table public.events add column if not exists end_time text;
alter table public.events add column if not exists location text;
alter table public.events add column if not exists community text;
alter table public.events add column if not exists organizer_name text;
alter table public.events add column if not exists organizer_email text;
alter table public.events add column if not exists organizer_phone text;
alter table public.events add column if not exists status text default 'published';
alter table public.events add column if not exists source text default 'editor';
alter table public.events add column if not exists created_at timestamptz default now();
alter table public.events add column if not exists updated_at timestamptz default now();

alter table public.event_submissions enable row level security;
alter table public.events enable row level security;

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

drop policy if exists "events_public_read_published" on public.events;
drop policy if exists events_public_read_published on public.events;
create policy "events_public_read_published"
on public.events
for select
to anon, authenticated
using (lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active'));

drop policy if exists "events_authenticated_manage" on public.events;
drop policy if exists events_authenticated_manage on public.events;
create policy "events_authenticated_manage"
on public.events
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_event_submissions_status_date
on public.event_submissions (status, event_date, created_at desc);

create index if not exists idx_events_status_date
on public.events (status, event_date, created_at desc);

alter table public.articles add column if not exists published_at timestamptz;
alter table public.articles add column if not exists created_at timestamptz default now();
alter table public.articles add column if not exists updated_at timestamptz default now();

update public.articles
set published_at = coalesce(published_at, created_at, updated_at, now()),
    created_at = coalesce(created_at, published_at, updated_at, now()),
    updated_at = now()
where (
    lower(coalesce(category, '')) like '%opinion%'
    or lower(coalesce(category, '')) like '%editorial%'
    or lower(coalesce(slug, '')) like '%opinion%'
    or lower(coalesce(slug, '')) like '%editorial%'
  )
  and (published_at is null or created_at is null);
