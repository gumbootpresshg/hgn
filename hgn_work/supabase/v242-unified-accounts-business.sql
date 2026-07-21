-- HGN v242 - Unified Accounts + Business/Organization Foundation
-- One Supabase Auth user_id controls marketplace, newsletters, subscriptions, events, Island Lens, directory and business tools.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.hgn_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  display_name text,
  account_type text not null default 'free_individual',
  phone text,
  community text,
  newsletter_opt_in boolean default false,
  member_badge boolean default false,
  verified_plus boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint hgn_profiles_account_type_check check (
    account_type in ('free_individual', 'paid_individual', 'business_organization')
  )
);

create unique index if not exists idx_hgn_profiles_user_id on public.hgn_profiles (user_id);

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  category text,
  description text,
  phone text,
  email text,
  website text,
  address text,
  community text,
  hours text,
  logo_url text,
  photo_urls text[] default '{}',
  facebook_url text,
  instagram_url text,
  x_url text,
  social_links jsonb default '{}'::jsonb,
  services_offered text,
  status text default 'draft',
  subscription_status text default 'none',
  billing_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_business_profiles_user_id on public.business_profiles (user_id);

-- Add user ownership to common content areas where possible.
alter table public.classifieds add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.classifieds add column if not exists account_type text;
alter table public.classifieds add column if not exists business_profile_id uuid references public.business_profiles(id) on delete set null;

alter table public.events add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.events add column if not exists business_profile_id uuid references public.business_profiles(id) on delete set null;

alter table public.event_submissions add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.event_submissions add column if not exists business_profile_id uuid references public.business_profiles(id) on delete set null;

alter table public.island_lens_items add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.island_lens_items add column if not exists business_profile_id uuid references public.business_profiles(id) on delete set null;

alter table public.newsletter_drafts add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Keep old member_permissions compatible but add unified columns.
alter table public.member_permissions add column if not exists account_type text default 'free_individual';
alter table public.member_permissions add column if not exists is_business_account boolean default false;
alter table public.member_permissions add column if not exists can_manage_business_profile boolean default false;
alter table public.member_permissions add column if not exists can_post_events boolean default true;
alter table public.member_permissions add column if not exists can_submit_island_lens boolean default true;
alter table public.member_permissions add column if not exists can_comment boolean default true;

alter table public.hgn_profiles enable row level security;
alter table public.business_profiles enable row level security;

drop policy if exists "hgn_profiles_owner_read" on public.hgn_profiles;
create policy "hgn_profiles_owner_read"
on public.hgn_profiles for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "hgn_profiles_owner_insert" on public.hgn_profiles;
create policy "hgn_profiles_owner_insert"
on public.hgn_profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "hgn_profiles_owner_update" on public.hgn_profiles;
create policy "hgn_profiles_owner_update"
on public.hgn_profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "business_profiles_public_read_active" on public.business_profiles;
create policy "business_profiles_public_read_active"
on public.business_profiles for select
to anon, authenticated
using (status in ('published','approved','public','live','active'));

drop policy if exists "business_profiles_owner_read" on public.business_profiles;
create policy "business_profiles_owner_read"
on public.business_profiles for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "business_profiles_owner_insert" on public.business_profiles;
create policy "business_profiles_owner_insert"
on public.business_profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "business_profiles_owner_update" on public.business_profiles;
create policy "business_profiles_owner_update"
on public.business_profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "business_profiles_admin_manage" on public.business_profiles;
create policy "business_profiles_admin_manage"
on public.business_profiles for all
to authenticated
using (true)
with check (true);

notify pgrst, 'reload schema';
