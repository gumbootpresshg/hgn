-- HGN v153 - Online Beta Share Gate
-- Defensive migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.online_beta_share_gate (
  id uuid primary key default gen_random_uuid(),
  gate_key text not null,
  gate_label text not null,
  category text not null default 'online_beta',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.online_beta_share_gate add column if not exists gate_key text;
alter table public.online_beta_share_gate add column if not exists gate_label text;
alter table public.online_beta_share_gate add column if not exists category text default 'online_beta';
alter table public.online_beta_share_gate add column if not exists status text default 'pending';
alter table public.online_beta_share_gate add column if not exists priority text default 'normal';
alter table public.online_beta_share_gate add column if not exists notes text;
alter table public.online_beta_share_gate add column if not exists created_at timestamptz default now();
alter table public.online_beta_share_gate add column if not exists updated_at timestamptz default now();

update public.online_beta_share_gate
   set gate_key = coalesce(gate_key, 'share_gate_' || left(md5(coalesce(id::text, now()::text)), 10)),
       gate_label = coalesce(gate_label, 'Online beta share gate'),
       category = coalesce(category, 'online_beta'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where gate_key is null
    or gate_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.online_beta_share_gate alter column gate_key set not null;
alter table public.online_beta_share_gate alter column gate_label set not null;

insert into public.online_beta_share_gate (
  gate_key, gate_label, category, status, priority, notes
)
select
  'homepage_share_ready',
  'Homepage ready to share',
  'public_site',
  'pending',
  'high',
  'Open the homepage on desktop and phone and decide if it is ready to share.'
where not exists (
  select 1 from public.online_beta_share_gate
  where gate_key = 'homepage_share_ready'
);

insert into public.online_beta_share_gate (
  gate_key, gate_label, category, status, priority, notes
)
select
  'first_story_end_to_end',
  'First story end-to-end',
  'publishing',
  'pending',
  'high',
  'Publish or review one real story with image, credit, SEO, and homepage placement.'
where not exists (
  select 1 from public.online_beta_share_gate
  where gate_key = 'first_story_end_to_end'
);

insert into public.online_beta_share_gate (
  gate_key, gate_label, category, status, priority, notes
)
select
  'letter_alert_verified',
  'Letter alert verified',
  'submissions',
  'pending',
  'high',
  'Submit one test Letter to the Editor and confirm the alert lands in the right inbox.'
where not exists (
  select 1 from public.online_beta_share_gate
  where gate_key = 'letter_alert_verified'
);

insert into public.online_beta_share_gate (
  gate_key, gate_label, category, status, priority, notes
)
select
  'admin_pages_private',
  'Admin pages private',
  'security',
  'pending',
  'high',
  'Confirm admin pages require login before public beta sharing.'
where not exists (
  select 1 from public.online_beta_share_gate
  where gate_key = 'admin_pages_private'
);

insert into public.online_beta_share_gate (
  gate_key, gate_label, category, status, priority, notes
)
select
  'rollback_notes_ready',
  'Rollback notes ready',
  'deployment',
  'ready',
  'normal',
  'Keep the previous verified zip and SQL migration notes available before deploying.'
where not exists (
  select 1 from public.online_beta_share_gate
  where gate_key = 'rollback_notes_ready'
);
