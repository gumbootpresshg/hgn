-- HGN v162 - Marketplace Review Fix
-- Fixes marketplace submissions not appearing in /admin/submissions.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.classified_submissions (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text default 'marketplace',
  price text,
  location text,
  seller_name text,
  seller_email text,
  seller_phone text,
  image_url text,
  status text not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classified_submissions add column if not exists title text;
alter table public.classified_submissions add column if not exists description text;
alter table public.classified_submissions add column if not exists category text default 'marketplace';
alter table public.classified_submissions add column if not exists price text;
alter table public.classified_submissions add column if not exists location text;
alter table public.classified_submissions add column if not exists seller_name text;
alter table public.classified_submissions add column if not exists seller_email text;
alter table public.classified_submissions add column if not exists seller_phone text;
alter table public.classified_submissions add column if not exists image_url text;
alter table public.classified_submissions add column if not exists status text default 'pending';
alter table public.classified_submissions add column if not exists admin_notes text;
alter table public.classified_submissions add column if not exists created_at timestamptz default now();
alter table public.classified_submissions add column if not exists updated_at timestamptz default now();

alter table public.classified_submissions enable row level security;

drop policy if exists public_insert_classified_submissions on public.classified_submissions;
create policy public_insert_classified_submissions on public.classified_submissions
for insert to anon, authenticated with check (true);

drop policy if exists authenticated_review_classified_submissions on public.classified_submissions;
create policy authenticated_review_classified_submissions on public.classified_submissions
for all to authenticated using (true) with check (true);

-- If an older marketplace_posts table exists, make it reviewable too.
do $$
begin
  if to_regclass('public.marketplace_posts') is not null then
    alter table public.marketplace_posts add column if not exists status text default 'pending';
    alter table public.marketplace_posts add column if not exists admin_notes text;
    alter table public.marketplace_posts add column if not exists created_at timestamptz default now();
    alter table public.marketplace_posts enable row level security;

    drop policy if exists public_insert_marketplace_posts on public.marketplace_posts;
    create policy public_insert_marketplace_posts on public.marketplace_posts
    for insert to anon, authenticated with check (true);

    drop policy if exists authenticated_review_marketplace_posts on public.marketplace_posts;
    create policy authenticated_review_marketplace_posts on public.marketplace_posts
    for all to authenticated using (true) with check (true);
  end if;
end $$;

-- If an older marketplace table exists, make it reviewable too.
do $$
begin
  if to_regclass('public.marketplace') is not null then
    alter table public.marketplace add column if not exists status text default 'pending';
    alter table public.marketplace add column if not exists admin_notes text;
    alter table public.marketplace add column if not exists created_at timestamptz default now();
    alter table public.marketplace enable row level security;

    drop policy if exists public_insert_marketplace on public.marketplace;
    create policy public_insert_marketplace on public.marketplace
    for insert to anon, authenticated with check (true);

    drop policy if exists authenticated_review_marketplace on public.marketplace;
    create policy authenticated_review_marketplace on public.marketplace
    for all to authenticated using (true) with check (true);
  end if;
end $$;

create index if not exists idx_classified_submissions_status_created
on public.classified_submissions (status, created_at desc);
