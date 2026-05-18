-- HGN v241 - Membership + Custom Newspaper
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.member_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  can_post_classifieds boolean default true,
  can_post_jobs boolean default false,
  can_post_real_estate boolean default false,
  newsletter_opt_in boolean default false,
  verified_plus boolean default false,
  is_paid_member boolean default false,
  membership_paid_until date,
  jobs_paid_until date,
  real_estate_paid_until date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.member_permissions add column if not exists is_paid_member boolean default false;
alter table public.member_permissions add column if not exists membership_paid_until date;
alter table public.member_permissions add column if not exists newsletter_opt_in boolean default false;
alter table public.member_permissions add column if not exists can_post_classifieds boolean default true;

create table if not exists public.member_newspaper_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text default 'My HGN',
  column_slugs text[] default '{}',
  news_sections text[] default '{}',
  classified_categories text[] default '{}',
  weather_location text,
  include_events boolean default true,
  include_obituaries boolean default true,
  include_island_lens boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.member_permissions enable row level security;
alter table public.member_newspaper_preferences enable row level security;

drop policy if exists "member_permissions_owner_read" on public.member_permissions;
create policy "member_permissions_owner_read"
on public.member_permissions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "member_permissions_owner_upsert" on public.member_permissions;
create policy "member_permissions_owner_upsert"
on public.member_permissions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "member_preferences_owner_manage" on public.member_newspaper_preferences;
create policy "member_preferences_owner_manage"
on public.member_newspaper_preferences for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "member_permissions_authenticated_manage" on public.member_permissions;
create policy "member_permissions_authenticated_manage"
on public.member_permissions for all
to authenticated
using (true)
with check (true);

create unique index if not exists idx_member_permissions_user on public.member_permissions (user_id);
create unique index if not exists idx_member_newspaper_preferences_user on public.member_newspaper_preferences (user_id);

notify pgrst, 'reload schema';
