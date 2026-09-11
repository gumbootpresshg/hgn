-- HGN v159 - Newsroom Simulation Pass
-- Stabilization pass 2 from the v157 freeze point.
-- Safe to rerun. No major new systems.

create extension if not exists pgcrypto;

create table if not exists public.newsroom_simulation_checks (
  id uuid primary key default gen_random_uuid(),
  check_key text not null,
  check_label text not null,
  category text not null default 'simulation',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsroom_simulation_checks add column if not exists check_key text;
alter table public.newsroom_simulation_checks add column if not exists check_label text;
alter table public.newsroom_simulation_checks add column if not exists category text default 'simulation';
alter table public.newsroom_simulation_checks add column if not exists status text default 'pending';
alter table public.newsroom_simulation_checks add column if not exists priority text default 'normal';
alter table public.newsroom_simulation_checks add column if not exists notes text;
alter table public.newsroom_simulation_checks add column if not exists created_at timestamptz default now();
alter table public.newsroom_simulation_checks add column if not exists updated_at timestamptz default now();

update public.newsroom_simulation_checks
   set check_key = coalesce(check_key, 'simulation_check_' || left(md5(coalesce(id::text, now()::text)), 10)),
       check_label = coalesce(check_label, 'Newsroom simulation check'),
       category = coalesce(category, 'simulation'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where check_key is null
    or check_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.newsroom_simulation_checks alter column check_key set not null;
alter table public.newsroom_simulation_checks alter column check_label set not null;

insert into public.newsroom_simulation_checks (check_key, check_label, category, status, priority, notes)
select 'publish_story_end_to_end', 'Publish one story end-to-end', 'publishing', 'pending', 'high',
       'Create or edit a real story, add image/credit/alt text, publish it, and place it on the homepage.'
where not exists (
  select 1 from public.newsroom_simulation_checks where check_key = 'publish_story_end_to_end'
);

insert into public.newsroom_simulation_checks (check_key, check_label, category, status, priority, notes)
select 'homepage_rotation_test', 'Homepage rotation test', 'homepage', 'pending', 'high',
       'Move the lead story, adjust ordering, and confirm desktop/mobile homepage still feels right.'
where not exists (
  select 1 from public.newsroom_simulation_checks where check_key = 'homepage_rotation_test'
);

insert into public.newsroom_simulation_checks (check_key, check_label, category, status, priority, notes)
select 'letter_submission_test', 'Letter submission test', 'submissions', 'pending', 'high',
       'Submit one test Letter to the Editor, confirm it stays private, and confirm alert delivery.'
where not exists (
  select 1 from public.newsroom_simulation_checks where check_key = 'letter_submission_test'
);

insert into public.newsroom_simulation_checks (check_key, check_label, category, status, priority, notes)
select 'mobile_only_session', 'Mobile-only review session', 'mobile', 'pending', 'high',
       'Use only a phone for at least one review session and log anything awkward or broken.'
where not exists (
  select 1 from public.newsroom_simulation_checks where check_key = 'mobile_only_session'
);

insert into public.newsroom_simulation_checks (check_key, check_label, category, status, priority, notes)
select 'live_update_drill', 'Live update drill', 'live', 'pending', 'normal',
       'Run a quick breaking/update workflow drill without publishing anything embarrassing.'
where not exists (
  select 1 from public.newsroom_simulation_checks where check_key = 'live_update_drill'
);
