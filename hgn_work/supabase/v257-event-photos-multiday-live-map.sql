-- Event submission polish: photos, multi-day/all-day support and live map categories.
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists is_all_day boolean default false;
alter table public.events add column if not exists start_date date;
alter table public.events add column if not exists end_date date;
alter table public.events add column if not exists start_time time;
alter table public.events add column if not exists end_time time;
alter table public.events add column if not exists event_date date;
alter table public.events add column if not exists updated_at timestamptz default now();

alter table public.event_submissions add column if not exists image_url text;
alter table public.event_submissions add column if not exists is_all_day boolean default false;
alter table public.event_submissions add column if not exists start_date date;
alter table public.event_submissions add column if not exists end_date date;
alter table public.event_submissions add column if not exists start_time time;
alter table public.event_submissions add column if not exists end_time time;
alter table public.event_submissions add column if not exists event_date date;
alter table public.event_submissions add column if not exists contact_name text;
alter table public.event_submissions add column if not exists contact_email text;
alter table public.event_submissions add column if not exists contact_phone text;
alter table public.event_submissions add column if not exists organizer_name text;
alter table public.event_submissions add column if not exists organizer_email text;
alter table public.event_submissions add column if not exists organizer_phone text;
alter table public.event_submissions add column if not exists admin_notes text;
alter table public.event_submissions add column if not exists published_event_id uuid;
alter table public.event_submissions add column if not exists updated_at timestamptz default now();

-- Keep old event_date populated for older components while newer views use start_date/end_date.
update public.events
set start_date = coalesce(start_date, event_date),
    end_date = coalesce(end_date, start_date, event_date)
where start_date is null or end_date is null;

update public.event_submissions
set start_date = coalesce(start_date, event_date),
    end_date = coalesce(end_date, start_date, event_date)
where start_date is null or end_date is null;

notify pgrst, 'reload schema';
