-- HGN v158 - Production Hardening Pass
-- Stabilization-only migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.production_hardening_checks (
  id uuid primary key default gen_random_uuid(),
  check_key text not null,
  check_label text not null,
  category text not null default 'production',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.production_hardening_checks add column if not exists check_key text;
alter table public.production_hardening_checks add column if not exists check_label text;
alter table public.production_hardening_checks add column if not exists category text default 'production';
alter table public.production_hardening_checks add column if not exists status text default 'pending';
alter table public.production_hardening_checks add column if not exists priority text default 'normal';
alter table public.production_hardening_checks add column if not exists notes text;
alter table public.production_hardening_checks add column if not exists created_at timestamptz default now();
alter table public.production_hardening_checks add column if not exists updated_at timestamptz default now();

update public.production_hardening_checks
   set check_key = coalesce(check_key, 'production_check_' || left(md5(coalesce(id::text, now()::text)), 10)),
       check_label = coalesce(check_label, 'Production hardening check'),
       category = coalesce(category, 'production'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where check_key is null
    or check_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.production_hardening_checks alter column check_key set not null;
alter table public.production_hardening_checks alter column check_label set not null;

insert into public.production_hardening_checks (check_key, check_label, category, status, priority, notes)
select 'admin_route_protection', 'Admin route protection', 'security', 'pending', 'high',
       'Confirm admin routes require login and are not visible to anonymous visitors.'
where not exists (
  select 1 from public.production_hardening_checks where check_key = 'admin_route_protection'
);

insert into public.production_hardening_checks (check_key, check_label, category, status, priority, notes)
select 'supabase_env_check', 'Supabase environment variables', 'deployment', 'pending', 'high',
       'Confirm production Supabase URL, anon key, and service role usage are safe.'
where not exists (
  select 1 from public.production_hardening_checks where check_key = 'supabase_env_check'
);

insert into public.production_hardening_checks (check_key, check_label, category, status, priority, notes)
select 'submission_form_validation', 'Submission form validation', 'forms', 'pending', 'high',
       'Confirm Letters to the Editor form handles required fields, spam, and errors cleanly.'
where not exists (
  select 1 from public.production_hardening_checks where check_key = 'submission_form_validation'
);

insert into public.production_hardening_checks (check_key, check_label, category, status, priority, notes)
select 'mobile_overflow_pass', 'Mobile overflow pass', 'mobile', 'pending', 'high',
       'Check public pages on phone for horizontal scroll, broken cards, and weak spacing.'
where not exists (
  select 1 from public.production_hardening_checks where check_key = 'mobile_overflow_pass'
);

insert into public.production_hardening_checks (check_key, check_label, category, status, priority, notes)
select 'empty_loading_error_states', 'Empty/loading/error states', 'ux', 'pending', 'normal',
       'Confirm key public and admin pages do not look broken when data is missing.'
where not exists (
  select 1 from public.production_hardening_checks where check_key = 'empty_loading_error_states'
);
