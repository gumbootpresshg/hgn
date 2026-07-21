-- Make Admin Events the source of truth for public event display.
-- Public pages now read approved rows from event_submissions instead of the legacy events table,
-- which prevents old seed/demo events from reappearing when they are not listed in Admin Events.

alter table public.event_submissions enable row level security;

alter table public.event_submissions add column if not exists start_date date;
alter table public.event_submissions add column if not exists end_date date;
alter table public.event_submissions add column if not exists is_all_day boolean default false;
alter table public.event_submissions add column if not exists image_url text;
alter table public.event_submissions add column if not exists published_event_id uuid;

update public.event_submissions
set start_date = coalesce(start_date, event_date),
    end_date = coalesce(end_date, start_date, event_date),
    updated_at = coalesce(updated_at, now())
where status in ('approved', 'published', 'public', 'live');

drop policy if exists event_submissions_public_read_approved on public.event_submissions;
drop policy if exists "event_submissions_public_read_approved" on public.event_submissions;
create policy "event_submissions_public_read_approved"
on public.event_submissions
for select
to anon, authenticated
using (status in ('approved', 'published', 'public', 'live'));

-- Keep the legacy public events table from showing obvious old demo/sample rows anywhere
-- that still happens to query it directly.
update public.events
set status = 'archived', updated_at = now()
where lower(coalesce(title, '')) like any (array[
  '%demo%',
  '%sample%',
  '%submit your%',
  '%submissions open%',
  '%event submissions%',
  '%calendar submissions%',
  '%this weekend on haida gwaii%'
])
or lower(coalesce(source, '')) in ('demo', 'sample', 'seed');
