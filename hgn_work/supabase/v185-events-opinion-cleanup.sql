-- HGN v185 - Event Editing + Opinion Section Cleanup
-- Safe to rerun.

create extension if not exists pgcrypto;

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

drop policy if exists "event_submissions_authenticated_manage" on public.event_submissions;
drop policy if exists event_submissions_authenticated_manage on public.event_submissions;
create policy "event_submissions_authenticated_manage"
on public.event_submissions
for all
to authenticated
using (true)
with check (true);

drop policy if exists "events_authenticated_manage" on public.events;
drop policy if exists events_authenticated_manage on public.events;
create policy "events_authenticated_manage"
on public.events
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

-- Normalize opinion sections using title/slug/category hints.
alter table public.articles add column if not exists category text;
alter table public.articles add column if not exists slug text;
alter table public.articles add column if not exists title text;
alter table public.articles add column if not exists updated_at timestamptz default now();

update public.articles
set category = 'Letters to the Editor',
    updated_at = now()
where lower(coalesce(title, '')) like '%letter to the editor%'
   or lower(coalesce(slug, '')) like '%letter-to-the-editor%'
   or lower(coalesce(category, '')) in ('letters', 'letter', 'letters to editor');

update public.articles
set category = 'On the Record',
    updated_at = now()
where lower(coalesce(title, '')) like '%on the record%'
   or lower(coalesce(slug, '')) like '%on-the-record%'
   or lower(coalesce(category, '')) in ('on the record', 'on-the-record', 'on_record');

update public.articles
set category = 'Editorial'
where (
    lower(coalesce(title, '')) like '%editorial%'
    or lower(coalesce(slug, '')) like '%editorial%'
    or lower(coalesce(category, '')) in ('editorials', 'editorial')
  )
  and lower(coalesce(title, '')) not like '%on the record%'
  and lower(coalesce(slug, '')) not like '%on-the-record%'
  and lower(coalesce(title, '')) not like '%letter to the editor%'
  and lower(coalesce(slug, '')) not like '%letter-to-the-editor%';

create index if not exists idx_articles_category_status_published
on public.articles (category, status, published_at desc, created_at desc);
