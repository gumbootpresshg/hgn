create extension if not exists pgcrypto;

create table if not exists public.hgn_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  display_name text,
  account_type text default 'free_individual',
  phone text,
  community text,
  newsletter_opt_in boolean default false,
  member_badge boolean default false,
  verified_plus boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.hgn_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.hgn_profiles add column if not exists email text;
alter table public.hgn_profiles add column if not exists display_name text;
alter table public.hgn_profiles add column if not exists account_type text default 'free_individual';
alter table public.hgn_profiles add column if not exists phone text;
alter table public.hgn_profiles add column if not exists community text;
alter table public.hgn_profiles add column if not exists newsletter_opt_in boolean default false;
alter table public.hgn_profiles add column if not exists member_badge boolean default false;
alter table public.hgn_profiles add column if not exists verified_plus boolean default false;
alter table public.hgn_profiles add column if not exists created_at timestamptz default now();
alter table public.hgn_profiles add column if not exists updated_at timestamptz default now();

create unique index if not exists idx_hgn_profiles_user_id_not_null
on public.hgn_profiles (user_id)
where user_id is not null;

alter table public.hgn_profiles enable row level security;

drop policy if exists "hgn_profiles_authenticated_read" on public.hgn_profiles;
create policy "hgn_profiles_authenticated_read"
on public.hgn_profiles for select
to authenticated
using (true);

drop policy if exists "hgn_profiles_authenticated_insert" on public.hgn_profiles;
create policy "hgn_profiles_authenticated_insert"
on public.hgn_profiles for insert
to authenticated
with check (true);

drop policy if exists "hgn_profiles_authenticated_update" on public.hgn_profiles;
create policy "hgn_profiles_authenticated_update"
on public.hgn_profiles for update
to authenticated
using (true)
with check (true);

drop policy if exists "hgn_profiles_authenticated_delete" on public.hgn_profiles;
create policy "hgn_profiles_authenticated_delete"
on public.hgn_profiles for delete
to authenticated
using (true);

notify pgrst, 'reload schema';
