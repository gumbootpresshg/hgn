alter table public.events add column if not exists is_all_day boolean default false;
alter table public.events add column if not exists start_date date;
alter table public.events add column if not exists end_date date;
alter table public.events add column if not exists start_time time;
alter table public.events add column if not exists end_time time;
alter table public.events add column if not exists status text default 'pending';
alter table public.events add column if not exists user_id uuid references auth.users(id) on delete set null;

create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  location text,
  community text,
  contact_name text,
  contact_email text,
  contact_phone text,
  is_all_day boolean default false,
  start_date date,
  end_date date,
  start_time time,
  end_time time,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.event_submissions add column if not exists is_all_day boolean default false;
alter table public.event_submissions add column if not exists start_date date;
alter table public.event_submissions add column if not exists end_date date;
alter table public.event_submissions add column if not exists start_time time;
alter table public.event_submissions add column if not exists end_time time;
alter table public.event_submissions add column if not exists status text default 'pending';

notify pgrst, 'reload schema';
