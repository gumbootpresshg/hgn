-- Dedicated Horoscope system for HGN
-- Run this in Supabase SQL Editor before using /admin/horoscope.

create table if not exists public.horoscopes (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Horoscope',
  horoscope_date date,
  author_name text,
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists horoscopes_status_date_idx
  on public.horoscopes (status, horoscope_date desc, published_at desc);

alter table public.horoscopes enable row level security;

-- Public readers can see only published horoscope posts.
drop policy if exists "Public can read published horoscopes" on public.horoscopes;
create policy "Public can read published horoscopes"
  on public.horoscopes
  for select
  using (status = 'published');

-- Allow authenticated users/admin tools to manage horoscope posts.
-- This matches the rest of the current HGN admin pattern that uses Supabase client writes.
drop policy if exists "Authenticated users can manage horoscopes" on public.horoscopes;
create policy "Authenticated users can manage horoscopes"
  on public.horoscopes
  for all
  to authenticated
  using (true)
  with check (true);
