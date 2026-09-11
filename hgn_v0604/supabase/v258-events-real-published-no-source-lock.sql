-- HGN v258 - Restore real public events without bringing back seed/demo rows.
-- Some real approved events were published before source='submitted' was added, so the
-- public calendar must not depend on that marker alone.

alter table public.events add column if not exists source text default 'editor';
alter table public.events add column if not exists start_date date;
alter table public.events add column if not exists end_date date;
alter table public.events add column if not exists event_date date;
alter table public.events add column if not exists updated_at timestamptz default now();
alter table public.event_submissions add column if not exists published_event_id uuid;
alter table public.event_submissions add column if not exists start_date date;
alter table public.event_submissions add column if not exists event_date date;

-- Normalize public events so month filtering works consistently.
update public.events
set start_date = coalesce(start_date, event_date),
    end_date = coalesce(end_date, start_date, event_date),
    event_date = coalesce(event_date, start_date),
    updated_at = now()
where start_date is null or event_date is null or end_date is null;

-- Mark existing public events that match approved submissions as submitted, without
-- requiring the code to hide unmarked real events.
update public.events e
set source = 'submitted', updated_at = now()
from public.event_submissions s
where s.status in ('approved', 'published')
  and lower(trim(coalesce(e.title, ''))) = lower(trim(coalesce(s.title, '')))
  and coalesce(e.event_date, e.start_date) = coalesce(s.start_date, s.event_date)
  and coalesce(e.source, '') <> 'submitted';

-- Archive only known placeholder/seed event prompts, not real local events.
update public.events
set status = 'archived', updated_at = now()
where status in ('approved', 'published', 'public', 'live', 'active')
  and (
    lower(coalesce(title, '')) like '%submit your%event%'
    or lower(coalesce(title, '')) like '%submit event%'
    or lower(coalesce(title, '')) like '%event submissions%'
    or lower(coalesce(title, '')) like '%calendar submissions%'
    or lower(coalesce(title, '')) like '%community calendar submissions%'
    or lower(coalesce(title, '')) like '%this weekend on haida gwaii%'
    or lower(coalesce(description, '')) like '%send events to hgn%'
    or lower(coalesce(description, '')) like '%send hgn your community events%'
    or lower(coalesce(description, '')) like '%use the events calendar to promote%'
    or lower(coalesce(description, '')) like '%submit community events for editor approval%'
  );

notify pgrst, 'reload schema';
