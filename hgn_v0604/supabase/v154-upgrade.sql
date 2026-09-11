-- HGN v154 - Live Beta Control Room
-- Defensive migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.live_beta_control_room (
  id uuid primary key default gen_random_uuid(),
  control_key text not null,
  control_label text not null,
  category text not null default 'live_beta',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.live_beta_control_room add column if not exists control_key text;
alter table public.live_beta_control_room add column if not exists control_label text;
alter table public.live_beta_control_room add column if not exists category text default 'live_beta';
alter table public.live_beta_control_room add column if not exists status text default 'pending';
alter table public.live_beta_control_room add column if not exists priority text default 'normal';
alter table public.live_beta_control_room add column if not exists notes text;
alter table public.live_beta_control_room add column if not exists created_at timestamptz default now();
alter table public.live_beta_control_room add column if not exists updated_at timestamptz default now();

update public.live_beta_control_room
   set control_key = coalesce(control_key, 'live_beta_' || left(md5(coalesce(id::text, now()::text)), 10)),
       control_label = coalesce(control_label, 'Live beta control check'),
       category = coalesce(category, 'live_beta'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where control_key is null
    or control_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.live_beta_control_room alter column control_key set not null;
alter table public.live_beta_control_room alter column control_label set not null;

insert into public.live_beta_control_room (control_key, control_label, category, status, priority, notes)
select 'homepage_freshness_watch', 'Homepage freshness watch', 'homepage', 'pending', 'high',
       'Check the homepage lead, latest stories, and stale items during beta.'
where not exists (
  select 1 from public.live_beta_control_room where control_key = 'homepage_freshness_watch'
);

insert into public.live_beta_control_room (control_key, control_label, category, status, priority, notes)
select 'reader_submission_watch', 'Reader submission watch', 'submissions', 'pending', 'high',
       'Watch Letters to the Editor and other submissions after the beta link is shared.'
where not exists (
  select 1 from public.live_beta_control_room where control_key = 'reader_submission_watch'
);

insert into public.live_beta_control_room (control_key, control_label, category, status, priority, notes)
select 'breaking_update_ready', 'Breaking update ready', 'publishing', 'ready', 'normal',
       'Keep the quick publish/live update path ready during beta.'
where not exists (
  select 1 from public.live_beta_control_room where control_key = 'breaking_update_ready'
);

insert into public.live_beta_control_room (control_key, control_label, category, status, priority, notes)
select 'admin_editor_checkin', 'Admin/editor check-in', 'workflow', 'ready', 'normal',
       'Use one lightweight check-in instead of multiple dashboards during beta.'
where not exists (
  select 1 from public.live_beta_control_room where control_key = 'admin_editor_checkin'
);
