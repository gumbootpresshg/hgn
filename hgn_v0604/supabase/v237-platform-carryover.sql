create extension if not exists pgcrypto;

create table if not exists public.island_lens_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  media_type text default 'photo',
  media_url text,
  thumbnail_url text,
  community text,
  credit text,
  status text default 'draft',
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.obituaries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text,
  tribute text,
  photo_url text,
  birth_date date,
  death_date date,
  community text,
  status text default 'draft',
  print_paid boolean default false,
  web_paid_until date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.member_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  can_post_classifieds boolean default true,
  can_post_jobs boolean default false,
  can_post_real_estate boolean default false,
  newsletter_opt_in boolean default false,
  verified_plus boolean default false,
  jobs_paid_until date,
  real_estate_paid_until date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.columnists add column if not exists bio text;
alter table public.columnists add column if not exists photo_url text;

alter table public.island_lens_items enable row level security;
alter table public.obituaries enable row level security;
alter table public.member_permissions enable row level security;

drop policy if exists "island_lens_public_read" on public.island_lens_items;
create policy "island_lens_public_read" on public.island_lens_items for select to anon, authenticated
using (status in ('published','approved','public','live','active'));

drop policy if exists "obituaries_public_read" on public.obituaries;
create policy "obituaries_public_read" on public.obituaries for select to anon, authenticated
using (status in ('published','approved','public','live','active'));

drop policy if exists "member_permissions_owner_read" on public.member_permissions;
create policy "member_permissions_owner_read" on public.member_permissions for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "member_permissions_authenticated_manage" on public.member_permissions;
create policy "member_permissions_authenticated_manage" on public.member_permissions for all to authenticated
using (true) with check (true);

drop policy if exists "island_lens_authenticated_manage" on public.island_lens_items;
create policy "island_lens_authenticated_manage" on public.island_lens_items for all to authenticated
using (true) with check (true);

drop policy if exists "obituaries_authenticated_manage" on public.obituaries;
create policy "obituaries_authenticated_manage" on public.obituaries for all to authenticated
using (true) with check (true);

create unique index if not exists idx_member_permissions_user on public.member_permissions (user_id);

notify pgrst, 'reload schema';
