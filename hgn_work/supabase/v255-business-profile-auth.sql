-- HGN v255 - Business Profile Account Ownership
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
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

alter table public.business_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.business_profiles add column if not exists business_name text;
alter table public.business_profiles add column if not exists category text;
alter table public.business_profiles add column if not exists description text;
alter table public.business_profiles add column if not exists phone text;
alter table public.business_profiles add column if not exists email text;
alter table public.business_profiles add column if not exists website text;
alter table public.business_profiles add column if not exists address text;
alter table public.business_profiles add column if not exists community text;
alter table public.business_profiles add column if not exists hours text;
alter table public.business_profiles add column if not exists logo_url text;
alter table public.business_profiles add column if not exists photo_urls text[] default '{}';
alter table public.business_profiles add column if not exists facebook_url text;
alter table public.business_profiles add column if not exists instagram_url text;
alter table public.business_profiles add column if not exists x_url text;
alter table public.business_profiles add column if not exists social_links jsonb default '{}'::jsonb;
alter table public.business_profiles add column if not exists services_offered text;
alter table public.business_profiles add column if not exists status text default 'draft';
alter table public.business_profiles add column if not exists subscription_status text default 'none';
alter table public.business_profiles add column if not exists billing_customer_id text;
alter table public.business_profiles add column if not exists created_at timestamptz default now();
alter table public.business_profiles add column if not exists updated_at timestamptz default now();

create unique index if not exists idx_business_profiles_user_id_not_null
on public.business_profiles (user_id)
where user_id is not null;

alter table public.business_profiles enable row level security;

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

drop policy if exists "business_profiles_owner_delete" on public.business_profiles;
create policy "business_profiles_owner_delete"
on public.business_profiles for delete
to authenticated
using (auth.uid() = user_id);

notify pgrst, 'reload schema';
