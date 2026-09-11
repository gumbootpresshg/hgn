-- HGN v156 - Community Pulse
-- Defensive migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.community_pulse_checks (
  id uuid primary key default gen_random_uuid(),
  pulse_key text not null,
  pulse_label text not null,
  category text not null default 'community',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_pulse_checks add column if not exists pulse_key text;
alter table public.community_pulse_checks add column if not exists pulse_label text;
alter table public.community_pulse_checks add column if not exists category text default 'community';
alter table public.community_pulse_checks add column if not exists status text default 'pending';
alter table public.community_pulse_checks add column if not exists priority text default 'normal';
alter table public.community_pulse_checks add column if not exists notes text;
alter table public.community_pulse_checks add column if not exists created_at timestamptz default now();
alter table public.community_pulse_checks add column if not exists updated_at timestamptz default now();

update public.community_pulse_checks
   set pulse_key = coalesce(pulse_key, 'community_pulse_' || left(md5(coalesce(id::text, now()::text)), 10)),
       pulse_label = coalesce(pulse_label, 'Community pulse check'),
       category = coalesce(category, 'community'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where pulse_key is null
    or pulse_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.community_pulse_checks alter column pulse_key set not null;
alter table public.community_pulse_checks alter column pulse_label set not null;

insert into public.community_pulse_checks (pulse_key, pulse_label, category, status, priority, notes)
select 'early_reader_reactions', 'Early reader reactions', 'feedback', 'pending', 'high',
       'Track the first real reader comments, questions, and confusion points.'
where not exists (
  select 1 from public.community_pulse_checks where pulse_key = 'early_reader_reactions'
);

insert into public.community_pulse_checks (pulse_key, pulse_label, category, status, priority, notes)
select 'stories_that_resonate', 'Stories that resonate', 'editorial', 'pending', 'high',
       'Note which stories get clicks, shares, replies, or direct comments.'
where not exists (
  select 1 from public.community_pulse_checks where pulse_key = 'stories_that_resonate'
);

insert into public.community_pulse_checks (pulse_key, pulse_label, category, status, priority, notes)
select 'letters_engagement_watch', 'Letters engagement watch', 'submissions', 'pending', 'high',
       'Watch whether readers use Letters to the Editor after beta sharing.'
where not exists (
  select 1 from public.community_pulse_checks where pulse_key = 'letters_engagement_watch'
);

insert into public.community_pulse_checks (pulse_key, pulse_label, category, status, priority, notes)
select 'homepage_local_relevance', 'Homepage local relevance', 'homepage', 'ready', 'normal',
       'Tune homepage order around what feels most useful to local readers.'
where not exists (
  select 1 from public.community_pulse_checks where pulse_key = 'homepage_local_relevance'
);
