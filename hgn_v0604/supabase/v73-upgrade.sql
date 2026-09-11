-- HGN v73 - Audience Growth Desk
-- Defensive beta migration: safe to run after earlier upgrade attempts.

create extension if not exists pgcrypto;

create table if not exists public.audience_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  channel text not null default 'newsletter',
  status text not null default 'draft',
  target_segment text not null default 'general readers',
  audience_goal text,
  call_to_action text,
  owner text,
  notes text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.audience_campaigns add column if not exists title text;
alter table public.audience_campaigns add column if not exists channel text not null default 'newsletter';
alter table public.audience_campaigns add column if not exists status text not null default 'draft';
alter table public.audience_campaigns add column if not exists target_segment text not null default 'general readers';
alter table public.audience_campaigns add column if not exists audience_goal text;
alter table public.audience_campaigns add column if not exists call_to_action text;
alter table public.audience_campaigns add column if not exists owner text;
alter table public.audience_campaigns add column if not exists notes text;
alter table public.audience_campaigns add column if not exists starts_at timestamptz;
alter table public.audience_campaigns add column if not exists ends_at timestamptz;
alter table public.audience_campaigns add column if not exists created_at timestamptz not null default now();
alter table public.audience_campaigns add column if not exists updated_at timestamptz not null default now();

create table if not exists public.audience_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel_type text not null default 'social',
  status text not null default 'planned',
  owner text,
  cadence text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.audience_channels add column if not exists name text;
alter table public.audience_channels add column if not exists channel_type text not null default 'social';
alter table public.audience_channels add column if not exists status text not null default 'planned';
alter table public.audience_channels add column if not exists owner text;
alter table public.audience_channels add column if not exists cadence text;
alter table public.audience_channels add column if not exists notes text;
alter table public.audience_channels add column if not exists created_at timestamptz not null default now();
alter table public.audience_channels add column if not exists updated_at timestamptz not null default now();

create table if not exists public.audience_growth_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'newsletter',
  status text not null default 'todo',
  priority text not null default 'normal',
  owner text,
  notes text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.audience_growth_tasks add column if not exists title text;
alter table public.audience_growth_tasks add column if not exists area text not null default 'newsletter';
alter table public.audience_growth_tasks add column if not exists status text not null default 'todo';
alter table public.audience_growth_tasks add column if not exists priority text not null default 'normal';
alter table public.audience_growth_tasks add column if not exists owner text;
alter table public.audience_growth_tasks add column if not exists notes text;
alter table public.audience_growth_tasks add column if not exists due_at timestamptz;
alter table public.audience_growth_tasks add column if not exists created_at timestamptz not null default now();
alter table public.audience_growth_tasks add column if not exists updated_at timestamptz not null default now();

create table if not exists public.audience_experiments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  hypothesis text,
  metric text,
  status text not null default 'planned',
  owner text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.audience_experiments add column if not exists title text;
alter table public.audience_experiments add column if not exists hypothesis text;
alter table public.audience_experiments add column if not exists metric text;
alter table public.audience_experiments add column if not exists status text not null default 'planned';
alter table public.audience_experiments add column if not exists owner text;
alter table public.audience_experiments add column if not exists notes text;
alter table public.audience_experiments add column if not exists created_at timestamptz not null default now();
alter table public.audience_experiments add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_audience_campaigns_status on public.audience_campaigns(status);
create index if not exists idx_audience_campaigns_channel on public.audience_campaigns(channel);
create index if not exists idx_audience_channels_status on public.audience_channels(status);
create index if not exists idx_audience_growth_tasks_status on public.audience_growth_tasks(status);
create index if not exists idx_audience_growth_tasks_priority on public.audience_growth_tasks(priority);
create index if not exists idx_audience_experiments_status on public.audience_experiments(status);

insert into public.audience_campaigns (title, channel, status, target_segment, audience_goal, call_to_action, owner, notes)
select 'Beta newsletter signup push', 'newsletter', 'queued', 'early readers', 'Build the first reliable beta reader list', 'Join the HGN newsletter for launch updates.', 'HGN team', 'Seed campaign for v73 audience growth desk.'
where not exists (select 1 from public.audience_campaigns where title = 'Beta newsletter signup push');

insert into public.audience_channels (name, channel_type, status, cadence, owner, notes)
select 'HGN newsletter', 'newsletter', 'ready', 'Weekly during beta', 'HGN team', 'Primary owned audience channel for launch.'
where not exists (select 1 from public.audience_channels where name = 'HGN newsletter');

insert into public.audience_growth_tasks (title, area, status, priority, owner, notes)
select 'Confirm beta signup path works end to end', 'newsletter', 'todo', 'high', 'HGN team', 'Test signup form, confirmation email, list capture and admin review.'
where not exists (select 1 from public.audience_growth_tasks where title = 'Confirm beta signup path works end to end');

insert into public.audience_experiments (title, hypothesis, metric, status, owner, notes)
select 'Homepage newsletter CTA test', 'A clearer homepage newsletter CTA will increase beta signups.', 'newsletter_signup_rate', 'planned', 'HGN team', 'Track before/after once analytics are connected.'
where not exists (select 1 from public.audience_experiments where title = 'Homepage newsletter CTA test');
