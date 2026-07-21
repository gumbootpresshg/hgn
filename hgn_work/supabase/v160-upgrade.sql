-- HGN v160 - Controlled Beta Release Candidate
-- Final stabilization pass before controlled beta deployment.
-- Safe to rerun. No feature expansion.

create extension if not exists pgcrypto;

create table if not exists public.controlled_beta_release_checks (
  id uuid primary key default gen_random_uuid(),
  check_key text not null,
  check_label text not null,
  category text not null default 'release_candidate',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.controlled_beta_release_checks add column if not exists check_key text;
alter table public.controlled_beta_release_checks add column if not exists check_label text;
alter table public.controlled_beta_release_checks add column if not exists category text default 'release_candidate';
alter table public.controlled_beta_release_checks add column if not exists status text default 'pending';
alter table public.controlled_beta_release_checks add column if not exists priority text default 'normal';
alter table public.controlled_beta_release_checks add column if not exists notes text;
alter table public.controlled_beta_release_checks add column if not exists created_at timestamptz default now();
alter table public.controlled_beta_release_checks add column if not exists updated_at timestamptz default now();

update public.controlled_beta_release_checks
   set check_key = coalesce(check_key, 'rc_check_' || left(md5(coalesce(id::text, now()::text)), 10)),
       check_label = coalesce(check_label, 'Controlled beta release check'),
       category = coalesce(category, 'release_candidate'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where check_key is null
    or check_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.controlled_beta_release_checks alter column check_key set not null;
alter table public.controlled_beta_release_checks alter column check_label set not null;

insert into public.controlled_beta_release_checks (check_key, check_label, category, status, priority, notes)
select 'production_build_pass', 'Production build passes', 'deployment', 'pending', 'high',
       'Run npm install, then npm run build. Fix only blocking build errors.'
where not exists (
  select 1 from public.controlled_beta_release_checks where check_key = 'production_build_pass'
);

insert into public.controlled_beta_release_checks (check_key, check_label, category, status, priority, notes)
select 'admin_auth_verified', 'Admin auth verified', 'security', 'pending', 'high',
       'Confirm admin routes require login and service keys are not exposed to the browser.'
where not exists (
  select 1 from public.controlled_beta_release_checks where check_key = 'admin_auth_verified'
);

insert into public.controlled_beta_release_checks (check_key, check_label, category, status, priority, notes)
select 'letters_alert_verified', 'Letters alert verified', 'submissions', 'pending', 'high',
       'Submit one test Letter to the Editor and confirm alert delivery.'
where not exists (
  select 1 from public.controlled_beta_release_checks where check_key = 'letters_alert_verified'
);

insert into public.controlled_beta_release_checks (check_key, check_label, category, status, priority, notes)
select 'homepage_mobile_pass', 'Homepage mobile pass', 'mobile', 'pending', 'high',
       'Check homepage and one article on a phone before sharing beta link.'
where not exists (
  select 1 from public.controlled_beta_release_checks where check_key = 'homepage_mobile_pass'
);

insert into public.controlled_beta_release_checks (check_key, check_label, category, status, priority, notes)
select 'beta_audience_limited', 'Controlled beta audience limited', 'launch', 'ready', 'normal',
       'Share with a small trusted group first. Do not promote broadly yet.'
where not exists (
  select 1 from public.controlled_beta_release_checks where check_key = 'beta_audience_limited'
);

insert into public.controlled_beta_release_checks (check_key, check_label, category, status, priority, notes)
select 'feature_freeze_confirmed', 'Feature freeze confirmed', 'workflow', 'ready', 'high',
       'Stop major feature waves after this release candidate. Fix bugs only during beta.'
where not exists (
  select 1 from public.controlled_beta_release_checks where check_key = 'feature_freeze_confirmed'
);
