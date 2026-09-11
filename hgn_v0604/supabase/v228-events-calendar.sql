-- HGN v228 - Events Calendar Helper Fields
-- Safe to rerun. Adds common event fields if missing.

create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  community text,
  location text,
  event_date date,
  start_time text,
  end_time text,
  category text,
  status text default 'published',
  image_url text,
  organizer text,
  contact_email text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events add column if not exists title text;
alter table public.events add column if not exists description text;
alter table public.events add column if not exists community text;
alter table public.events add column if not exists location text;
alter table public.events add column if not exists event_date date;
alter table public.events add column if not exists start_time text;
alter table public.events add column if not exists end_time text;
alter table public.events add column if not exists category text;
alter table public.events add column if not exists status text default 'published';
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists organizer text;
alter table public.events add column if not exists contact_email text;
alter table public.events add column if not exists website text;
alter table public.events add column if not exists created_at timestamptz default now();
alter table public.events add column if not exists updated_at timestamptz default now();

alter table public.events enable row level security;

drop policy if exists "events_public_read_published" on public.events;
create policy "events_public_read_published"
on public.events
for select
to anon, authenticated
using (status in ('approved', 'published', 'public', 'live', 'active'));

create index if not exists idx_events_calendar
on public.events (status, event_date, community);

notify pgrst, 'reload schema';
