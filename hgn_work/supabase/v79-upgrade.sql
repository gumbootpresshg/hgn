-- HGN v79 upgrade: Distribution Desk
-- Safe to run more than once. Adds beta distribution planning for social, newsletter,
-- RSS/sitemap checks, and post-publish follow-up.

create extension if not exists pgcrypto;

create table if not exists public.distribution_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel_type text not null default 'social',
  status text not null default 'active',
  owner text,
  audience_note text,
  posting_cadence text,
  url text,
  is_primary boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.distribution_channels add column if not exists name text;
alter table public.distribution_channels add column if not exists channel_type text not null default 'social';
alter table public.distribution_channels add column if not exists status text not null default 'active';
alter table public.distribution_channels add column if not exists owner text;
alter table public.distribution_channels add column if not exists audience_note text;
alter table public.distribution_channels add column if not exists posting_cadence text;
alter table public.distribution_channels add column if not exists url text;
alter table public.distribution_channels add column if not exists is_primary boolean not null default false;
alter table public.distribution_channels add column if not exists sort_order integer not null default 100;
alter table public.distribution_channels add column if not exists created_at timestamptz not null default now();
alter table public.distribution_channels add column if not exists updated_at timestamptz not null default now();

create table if not exists public.distribution_runs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  story_slug text,
  article_id uuid,
  status text not null default 'planned',
  priority text not null default 'normal',
  publish_date date not null default current_date,
  publish_window text not null default 'same day',
  owner text,
  summary text,
  newsletter_angle text,
  social_angle text,
  seo_check boolean not null default false,
  rss_check boolean not null default false,
  image_check boolean not null default false,
  link_check boolean not null default false,
  followup_needed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.distribution_runs add column if not exists title text;
alter table public.distribution_runs add column if not exists story_slug text;
alter table public.distribution_runs add column if not exists article_id uuid;
alter table public.distribution_runs add column if not exists status text not null default 'planned';
alter table public.distribution_runs add column if not exists priority text not null default 'normal';
alter table public.distribution_runs add column if not exists publish_date date not null default current_date;
alter table public.distribution_runs add column if not exists publish_window text not null default 'same day';
alter table public.distribution_runs add column if not exists owner text;
alter table public.distribution_runs add column if not exists summary text;
alter table public.distribution_runs add column if not exists newsletter_angle text;
alter table public.distribution_runs add column if not exists social_angle text;
alter table public.distribution_runs add column if not exists seo_check boolean not null default false;
alter table public.distribution_runs add column if not exists rss_check boolean not null default false;
alter table public.distribution_runs add column if not exists image_check boolean not null default false;
alter table public.distribution_runs add column if not exists link_check boolean not null default false;
alter table public.distribution_runs add column if not exists followup_needed boolean not null default false;
alter table public.distribution_runs add column if not exists notes text;
alter table public.distribution_runs add column if not exists created_at timestamptz not null default now();
alter table public.distribution_runs add column if not exists updated_at timestamptz not null default now();

create table if not exists public.distribution_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.distribution_runs(id) on delete cascade,
  channel_id uuid references public.distribution_channels(id) on delete set null,
  title text not null,
  task_type text not null default 'post',
  status text not null default 'todo',
  owner text,
  due_at timestamptz,
  copy text,
  destination_url text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.distribution_tasks add column if not exists run_id uuid references public.distribution_runs(id) on delete cascade;
alter table public.distribution_tasks add column if not exists channel_id uuid references public.distribution_channels(id) on delete set null;
alter table public.distribution_tasks add column if not exists title text;
alter table public.distribution_tasks add column if not exists task_type text not null default 'post';
alter table public.distribution_tasks add column if not exists status text not null default 'todo';
alter table public.distribution_tasks add column if not exists owner text;
alter table public.distribution_tasks add column if not exists due_at timestamptz;
alter table public.distribution_tasks add column if not exists copy text;
alter table public.distribution_tasks add column if not exists destination_url text;
alter table public.distribution_tasks add column if not exists notes text;
alter table public.distribution_tasks add column if not exists completed_at timestamptz;
alter table public.distribution_tasks add column if not exists created_at timestamptz not null default now();
alter table public.distribution_tasks add column if not exists updated_at timestamptz not null default now();

create index if not exists distribution_channels_status_idx on public.distribution_channels(status, channel_type);
create index if not exists distribution_runs_status_idx on public.distribution_runs(status, publish_date desc);
create index if not exists distribution_tasks_status_idx on public.distribution_tasks(status, due_at);
create index if not exists distribution_tasks_run_idx on public.distribution_tasks(run_id);

insert into public.distribution_channels (name, channel_type, status, owner, audience_note, posting_cadence, url, is_primary, sort_order)
select 'HGN website', 'owned', 'active', 'Editor', 'Primary destination for all beta publishing.', 'daily', '/', true, 10
where not exists (select 1 from public.distribution_channels where lower(name) = 'hgn website');

insert into public.distribution_channels (name, channel_type, status, owner, audience_note, posting_cadence, url, is_primary, sort_order)
select 'Newsletter', 'email', 'active', 'Newsletter desk', 'Most reliable beta retention channel.', 'weekly beta digest', '/newsletter', true, 20
where not exists (select 1 from public.distribution_channels where lower(name) = 'newsletter');

insert into public.distribution_channels (name, channel_type, status, owner, audience_note, posting_cadence, url, is_primary, sort_order)
select 'Facebook community update', 'social', 'planned', 'Comms', 'Local reach and community discussion.', 'story-dependent', null, false, 30
where not exists (select 1 from public.distribution_channels where lower(name) = 'facebook community update');

insert into public.distribution_runs (title, story_slug, status, priority, publish_date, publish_window, owner, summary, newsletter_angle, social_angle, seo_check, rss_check, image_check, link_check, followup_needed, notes)
select 'Beta launch distribution dry run', 'beta-launch', 'planned', 'high', current_date, 'same day', 'Editor', 'Confirm the story can move from publish to RSS, newsletter, social, and follow-up without gaps.', 'Invite readers to join the beta list and report bugs.', 'Position HGN as a community-first Haida Gwaii news platform preparing for beta.', true, true, true, false, true, 'Use this as the first distribution rehearsal before opening beta.'
where not exists (select 1 from public.distribution_runs where lower(title) = 'beta launch distribution dry run');
