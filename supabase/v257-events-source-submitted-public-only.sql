-- Keep public calendar clean: only events approved from real submissions should be public.
-- Older migration/demo rows used source='editor' or no source and can show up as fake May events.

alter table public.events add column if not exists source text default 'editor';

-- Backfill existing approved submissions that already created matching public events.
update public.events e
set source = 'submitted', updated_at = now()
from public.event_submissions s
where s.status in ('approved', 'published')
  and lower(trim(coalesce(e.title, ''))) = lower(trim(coalesce(s.title, '')))
  and coalesce(e.event_date, e.start_date) = coalesce(s.start_date, s.event_date)
  and coalesce(e.source, '') <> 'submitted';

-- Archive old seed/demo calendar rows so they cannot come back through public queries.
update public.events
set status = 'archived', updated_at = now()
where coalesce(source, 'editor') <> 'submitted'
  and status in ('approved', 'published', 'public', 'live', 'active')
  and (
    lower(coalesce(title, '')) like '%submit%event%'
    or lower(coalesce(title, '')) like '%submissions open%'
    or lower(coalesce(title, '')) like '%community calendar%'
    or lower(coalesce(title, '')) like '%this weekend%'
    or lower(coalesce(description, '')) like '%send events to hgn%'
    or lower(coalesce(description, '')) like '%submit community events%'
    or lower(coalesce(description, '')) like '%use the events calendar%'
  );
