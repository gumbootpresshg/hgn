-- HGN v188 - Ad Manager
-- Adds admin-managed ad placements and ads.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.ad_placements (
  id uuid primary key default gen_random_uuid(),
  placement_key text not null unique,
  label text not null,
  description text,
  page_area text,
  max_ads integer default 1,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  advertiser_name text,
  placement_key text not null,
  image_url text,
  destination_url text,
  alt_text text,
  html_code text,
  start_date date,
  end_date date,
  status text not null default 'draft',
  sort_order integer default 0,
  impressions integer default 0,
  clicks integer default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ad_placements add column if not exists placement_key text;
alter table public.ad_placements add column if not exists label text;
alter table public.ad_placements add column if not exists description text;
alter table public.ad_placements add column if not exists page_area text;
alter table public.ad_placements add column if not exists max_ads integer default 1;
alter table public.ad_placements add column if not exists is_active boolean default true;
alter table public.ad_placements add column if not exists created_at timestamptz default now();
alter table public.ad_placements add column if not exists updated_at timestamptz default now();

alter table public.ads add column if not exists title text;
alter table public.ads add column if not exists advertiser_name text;
alter table public.ads add column if not exists placement_key text;
alter table public.ads add column if not exists image_url text;
alter table public.ads add column if not exists destination_url text;
alter table public.ads add column if not exists alt_text text;
alter table public.ads add column if not exists html_code text;
alter table public.ads add column if not exists start_date date;
alter table public.ads add column if not exists end_date date;
alter table public.ads add column if not exists status text default 'draft';
alter table public.ads add column if not exists sort_order integer default 0;
alter table public.ads add column if not exists impressions integer default 0;
alter table public.ads add column if not exists clicks integer default 0;
alter table public.ads add column if not exists notes text;
alter table public.ads add column if not exists created_at timestamptz default now();
alter table public.ads add column if not exists updated_at timestamptz default now();

insert into public.ad_placements (placement_key, label, description, page_area, max_ads, is_active)
values
  ('site_top', 'Site Top Banner', 'Top banner across the site.', 'global', 1, true),
  ('home_middle', 'Home Middle Banner', 'Mid-page homepage banner.', 'home', 1, true),
  ('home_sidebar', 'Home Sidebar', 'Sidebar placement on homepage/news layout.', 'home', 3, true),
  ('article_top', 'Article Top', 'Ad near the top of articles.', 'article', 1, true),
  ('article_bottom', 'Article Bottom', 'Single clean bottom ad under articles.', 'article', 1, true),
  ('classifieds_top', 'Classifieds Top', 'Top of classifieds/marketplace.', 'classifieds', 1, true),
  ('real_estate_top', 'Real Estate Top', 'Top of real estate page.', 'real_estate', 1, true),
  ('events_top', 'Events Top', 'Top of events page.', 'events', 1, true)
on conflict (placement_key) do update
set label = excluded.label,
    description = excluded.description,
    page_area = excluded.page_area,
    max_ads = excluded.max_ads,
    is_active = excluded.is_active,
    updated_at = now();

update public.ads
set status = coalesce(nullif(status, ''), 'draft'),
    sort_order = coalesce(sort_order, 0),
    impressions = coalesce(impressions, 0),
    clicks = coalesce(clicks, 0),
    updated_at = now()
where status is null
   or status = ''
   or sort_order is null
   or impressions is null
   or clicks is null;

alter table public.ad_placements enable row level security;
alter table public.ads enable row level security;

drop policy if exists "ad_placements_public_read_active" on public.ad_placements;
create policy "ad_placements_public_read_active"
on public.ad_placements
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "ad_placements_authenticated_manage" on public.ad_placements;
create policy "ad_placements_authenticated_manage"
on public.ad_placements
for all
to authenticated
using (true)
with check (true);

drop policy if exists "ads_public_read_active" on public.ads;
create policy "ads_public_read_active"
on public.ads
for select
to anon, authenticated
using (
  lower(coalesce(status, '')) in ('active', 'published', 'live')
  and (start_date is null or start_date <= current_date)
  and (end_date is null or end_date >= current_date)
);

drop policy if exists "ads_authenticated_manage" on public.ads;
create policy "ads_authenticated_manage"
on public.ads
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_ads_placement_status_dates
on public.ads (placement_key, status, start_date, end_date, sort_order);

create index if not exists idx_ad_placements_key_active
on public.ad_placements (placement_key, is_active);
