-- HGN v192 - Ad Placements Legacy Placement Fix
-- Fixes required legacy columns on ad_placements:
-- business_name, title, and placement.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.ad_placements (
  id uuid primary key default gen_random_uuid(),
  business_name text default 'HGN House Ad',
  title text default 'Ad Placement',
  description text,
  placement text default 'site_top',
  type text default 'banner',
  status text default 'active',
  is_active boolean default true,
  placement_key text,
  label text,
  page_area text,
  max_ads integer default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ad_placements add column if not exists business_name text default 'HGN House Ad';
alter table public.ad_placements add column if not exists title text default 'Ad Placement';
alter table public.ad_placements add column if not exists description text;
alter table public.ad_placements add column if not exists placement text default 'site_top';
alter table public.ad_placements add column if not exists type text default 'banner';
alter table public.ad_placements add column if not exists status text default 'active';
alter table public.ad_placements add column if not exists is_active boolean default true;
alter table public.ad_placements add column if not exists placement_key text;
alter table public.ad_placements add column if not exists label text;
alter table public.ad_placements add column if not exists page_area text;
alter table public.ad_placements add column if not exists max_ads integer default 1;
alter table public.ad_placements add column if not exists created_at timestamptz default now();
alter table public.ad_placements add column if not exists updated_at timestamptz default now();

update public.ad_placements
set business_name = coalesce(nullif(business_name, ''), 'HGN House Ad'),
    title = coalesce(nullif(title, ''), nullif(label, ''), nullif(placement_key, ''), nullif(placement, ''), 'Ad Placement'),
    label = coalesce(nullif(label, ''), nullif(title, ''), nullif(placement_key, ''), nullif(placement, ''), 'Ad Placement'),
    placement = coalesce(nullif(placement, ''), nullif(placement_key, ''), 'site_top'),
    placement_key = coalesce(nullif(placement_key, ''), nullif(placement, ''), lower(regexp_replace(coalesce(title, label, business_name, id::text), '[^a-zA-Z0-9]+', '_', 'g'))),
    type = coalesce(nullif(type, ''), 'banner'),
    status = coalesce(nullif(status, ''), 'active'),
    is_active = coalesce(is_active, true),
    max_ads = coalesce(max_ads, 1),
    updated_at = now();

alter table public.ad_placements alter column business_name set default 'HGN House Ad';
alter table public.ad_placements alter column title set default 'Ad Placement';
alter table public.ad_placements alter column placement set default 'site_top';
alter table public.ad_placements alter column type set default 'banner';
alter table public.ad_placements alter column status set default 'active';
alter table public.ad_placements alter column label set default 'Ad Placement';
alter table public.ad_placements alter column max_ads set default 1;
alter table public.ad_placements alter column is_active set default true;

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text default 'Untitled ad',
  advertiser_name text,
  placement_key text,
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

alter table public.ads add column if not exists title text default 'Untitled ad';
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

delete from public.ad_placements a
using public.ad_placements b
where a.placement_key = b.placement_key
  and a.id > b.id
  and a.placement_key is not null;

create unique index if not exists idx_ad_placements_placement_key_unique
on public.ad_placements (placement_key)
where placement_key is not null;

insert into public.ad_placements (placement_key, placement, title, label, business_name, description, page_area, type, status, max_ads, is_active)
select 'site_top', 'site_top', 'Site Top Banner', 'Site Top Banner', 'HGN House Ad', 'Top banner across the site.', 'global', 'banner', 'active', 1, true
where not exists (select 1 from public.ad_placements where placement_key = 'site_top');

insert into public.ad_placements (placement_key, placement, title, label, business_name, description, page_area, type, status, max_ads, is_active)
select 'home_middle', 'home_middle', 'Home Middle Banner', 'Home Middle Banner', 'HGN House Ad', 'Mid-page homepage banner.', 'home', 'banner', 'active', 1, true
where not exists (select 1 from public.ad_placements where placement_key = 'home_middle');

insert into public.ad_placements (placement_key, placement, title, label, business_name, description, page_area, type, status, max_ads, is_active)
select 'home_sidebar', 'home_sidebar', 'Home Sidebar', 'Home Sidebar', 'HGN House Ad', 'Sidebar placement on homepage/news layout.', 'home', 'banner', 'active', 3, true
where not exists (select 1 from public.ad_placements where placement_key = 'home_sidebar');

insert into public.ad_placements (placement_key, placement, title, label, business_name, description, page_area, type, status, max_ads, is_active)
select 'article_top', 'article_top', 'Article Top', 'Article Top', 'HGN House Ad', 'Ad near the top of articles.', 'article', 'banner', 'active', 1, true
where not exists (select 1 from public.ad_placements where placement_key = 'article_top');

insert into public.ad_placements (placement_key, placement, title, label, business_name, description, page_area, type, status, max_ads, is_active)
select 'article_bottom', 'article_bottom', 'Article Bottom', 'Article Bottom', 'HGN House Ad', 'Single clean bottom ad under articles.', 'article', 'banner', 'active', 1, true
where not exists (select 1 from public.ad_placements where placement_key = 'article_bottom');

insert into public.ad_placements (placement_key, placement, title, label, business_name, description, page_area, type, status, max_ads, is_active)
select 'classifieds_top', 'classifieds_top', 'Classifieds Top', 'Classifieds Top', 'HGN House Ad', 'Top of classifieds/marketplace.', 'classifieds', 'banner', 'active', 1, true
where not exists (select 1 from public.ad_placements where placement_key = 'classifieds_top');

insert into public.ad_placements (placement_key, placement, title, label, business_name, description, page_area, type, status, max_ads, is_active)
select 'real_estate_top', 'real_estate_top', 'Real Estate Top', 'Real Estate Top', 'HGN House Ad', 'Top of real estate page.', 'real_estate', 'banner', 'active', 1, true
where not exists (select 1 from public.ad_placements where placement_key = 'real_estate_top');

insert into public.ad_placements (placement_key, placement, title, label, business_name, description, page_area, type, status, max_ads, is_active)
select 'events_top', 'events_top', 'Events Top', 'Events Top', 'HGN House Ad', 'Top of events page.', 'events', 'banner', 'active', 1, true
where not exists (select 1 from public.ad_placements where placement_key = 'events_top');

update public.ad_placements
set business_name = coalesce(nullif(business_name, ''), 'HGN House Ad'),
    title = coalesce(nullif(title, ''), nullif(label, ''), nullif(placement_key, ''), 'Ad Placement'),
    label = coalesce(nullif(label, ''), nullif(title, ''), 'Ad Placement'),
    placement = coalesce(nullif(placement, ''), nullif(placement_key, ''), 'site_top'),
    placement_key = coalesce(nullif(placement_key, ''), nullif(placement, ''), 'site_top'),
    type = coalesce(nullif(type, ''), 'banner'),
    status = coalesce(nullif(status, ''), 'active'),
    updated_at = now();

update public.ads
set title = coalesce(nullif(title, ''), 'Untitled ad'),
    status = coalesce(nullif(status, ''), 'draft'),
    sort_order = coalesce(sort_order, 0),
    impressions = coalesce(impressions, 0),
    clicks = coalesce(clicks, 0),
    updated_at = now();

alter table public.ad_placements enable row level security;
alter table public.ads enable row level security;

drop policy if exists "ad_placements_public_read_active" on public.ad_placements;
create policy "ad_placements_public_read_active" on public.ad_placements
for select to anon, authenticated
using (is_active = true and lower(coalesce(status, 'active')) in ('active', 'published', 'live'));

drop policy if exists "ad_placements_authenticated_manage" on public.ad_placements;
create policy "ad_placements_authenticated_manage" on public.ad_placements
for all to authenticated using (true) with check (true);

drop policy if exists "ads_public_read_active" on public.ads;
create policy "ads_public_read_active" on public.ads
for select to anon, authenticated
using (
  lower(coalesce(status, '')) in ('active', 'published', 'live')
  and (start_date is null or start_date <= current_date)
  and (end_date is null or end_date >= current_date)
);

drop policy if exists "ads_authenticated_manage" on public.ads;
create policy "ads_authenticated_manage" on public.ads
for all to authenticated using (true) with check (true);

create index if not exists idx_ads_placement_status_dates
on public.ads (placement_key, status, start_date, end_date, sort_order);

create index if not exists idx_ad_placements_key_active
on public.ad_placements (placement_key, placement, is_active, status);
