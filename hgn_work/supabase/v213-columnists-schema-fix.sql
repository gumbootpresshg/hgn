-- HGN v213 - Columnists Schema Fix
-- Fixes: Could not find the table 'public.columnists' in the schema cache
-- Run this in Supabase SQL Editor.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.columnists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  display_name text,
  description text,
  author_match text,
  category_match text,
  section_match text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.columnists add column if not exists name text;
alter table public.columnists add column if not exists slug text;
alter table public.columnists add column if not exists display_name text;
alter table public.columnists add column if not exists description text;
alter table public.columnists add column if not exists author_match text;
alter table public.columnists add column if not exists category_match text;
alter table public.columnists add column if not exists section_match text;
alter table public.columnists add column if not exists is_active boolean default true;
alter table public.columnists add column if not exists sort_order integer default 0;
alter table public.columnists add column if not exists created_at timestamptz default now();
alter table public.columnists add column if not exists updated_at timestamptz default now();

update public.columnists
set display_name = coalesce(nullif(display_name, ''), name),
    slug = coalesce(nullif(slug, ''), lower(regexp_replace(coalesce(name, id::text), '[^a-zA-Z0-9]+', '-', 'g'))),
    is_active = coalesce(is_active, true),
    sort_order = coalesce(sort_order, 0),
    updated_at = now()
where display_name is null
   or display_name = ''
   or slug is null
   or slug = ''
   or is_active is null
   or sort_order is null;

create unique index if not exists idx_columnists_slug_unique
on public.columnists (slug);

insert into public.columnists (name, slug, display_name, description, category_match, section_match, sort_order, is_active)
select 'Islanders', 'islanders', 'Islanders', 'Islanders column and recurring local feature.', 'islanders', 'islanders', 10, true
where not exists (select 1 from public.columnists where slug = 'islanders');

insert into public.columnists (name, slug, display_name, description, category_match, section_match, sort_order, is_active)
select 'Ask Annie', 'ask-annie', 'Ask Annie', 'Ask Annie column.', 'ask annie', 'ask annie', 20, false
where not exists (select 1 from public.columnists where slug = 'ask-annie');

insert into public.columnists (name, slug, display_name, description, category_match, section_match, sort_order, is_active)
select 'On the Rocks', 'on-the-rocks', 'On the Rocks', 'On the Rocks column.', 'on the rocks', 'on the rocks', 30, true
where not exists (select 1 from public.columnists where slug = 'on-the-rocks');

insert into public.columnists (name, slug, display_name, description, category_match, section_match, sort_order, is_active)
select 'This Week in History', 'this-week-in-history', 'This Week in History', 'History column.', 'history', 'history', 40, true
where not exists (select 1 from public.columnists where slug = 'this-week-in-history');

alter table public.columnists enable row level security;

drop policy if exists "columnists_public_read_active" on public.columnists;
create policy "columnists_public_read_active"
on public.columnists
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "columnists_authenticated_manage" on public.columnists;
create policy "columnists_authenticated_manage"
on public.columnists
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_columnists_active_sort
on public.columnists (is_active, sort_order, display_name);

-- Helps Supabase/PostgREST notice the new table quickly.
notify pgrst, 'reload schema';
