-- HGN v216 - Marketplace Categories
-- Adds/repairs marketplace category settings and vehicle/real-estate listing fields.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.classified_settings (
  id uuid primary key default gen_random_uuid(),
  setting_type text not null,
  label text not null,
  slug text not null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classified_settings add column if not exists setting_type text;
alter table public.classified_settings add column if not exists label text;
alter table public.classified_settings add column if not exists slug text;
alter table public.classified_settings add column if not exists sort_order integer default 0;
alter table public.classified_settings add column if not exists is_active boolean default true;
alter table public.classified_settings add column if not exists created_at timestamptz default now();
alter table public.classified_settings add column if not exists updated_at timestamptz default now();

create unique index if not exists idx_classified_settings_type_slug
on public.classified_settings (setting_type, slug);

insert into public.classified_settings (setting_type, label, slug, sort_order, is_active)
values
  ('marketplace_category', 'All Listings', 'all', 0, true),
  ('marketplace_category', 'Marketplace', 'marketplace', 10, true),
  ('marketplace_category', 'Real Estate', 'real-estate', 20, true),
  ('marketplace_category', 'Rentals', 'rentals', 30, true),
  ('marketplace_category', 'Wanted Rentals', 'wanted-rentals', 40, true),
  ('marketplace_category', 'Vehicles & Boats', 'vehicles-boats', 50, true),
  ('marketplace_category', 'Jobs', 'jobs', 60, true),
  ('marketplace_category', 'Notices', 'notices', 70, true),
  ('marketplace_category', 'Free', 'free', 80, true),
  ('marketplace_category', 'Services', 'services', 90, true)
on conflict (setting_type, slug) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now();

alter table public.classifieds add column if not exists category text default 'marketplace';
alter table public.classifieds add column if not exists listing_type text;
alter table public.classifieds add column if not exists town text;
alter table public.classifieds add column if not exists location text;
alter table public.classifieds add column if not exists price text;
alter table public.classifieds add column if not exists title text;
alter table public.classifieds add column if not exists description text;
alter table public.classifieds add column if not exists image_url text;
alter table public.classifieds add column if not exists status text default 'pending';
alter table public.classifieds add column if not exists is_featured boolean default false;
alter table public.classifieds add column if not exists bedrooms text;
alter table public.classifieds add column if not exists bathrooms text;
alter table public.classifieds add column if not exists property_address text;
alter table public.classifieds add column if not exists make text;
alter table public.classifieds add column if not exists model text;
alter table public.classifieds add column if not exists year text;
alter table public.classifieds add column if not exists updated_at timestamptz default now();

update public.classifieds
set category = case
  when lower(coalesce(listing_type, category, '')) in ('home-sale', 'home sale', 'real estate', 'real-estate') then 'real-estate'
  when lower(coalesce(listing_type, category, '')) in ('rental', 'rentals') then 'rentals'
  when lower(coalesce(listing_type, category, '')) in ('wanted-rental', 'wanted rental', 'wanted-rentals') then 'wanted-rentals'
  when lower(coalesce(listing_type, category, '')) in ('vehicle', 'vehicles', 'boat', 'boats', 'vehicles-boats') then 'vehicles-boats'
  else coalesce(nullif(category, ''), 'marketplace')
end,
town = coalesce(nullif(town, ''), nullif(location, ''), 'Island-wide'),
status = coalesce(nullif(status, ''), 'pending'),
updated_at = now()
where category is null
   or category = ''
   or town is null
   or town = ''
   or status is null
   or status = ''
   or lower(coalesce(listing_type, category, '')) in ('home-sale', 'home sale', 'real estate', 'real-estate', 'rental', 'rentals', 'wanted-rental', 'wanted rental', 'vehicle', 'vehicles', 'boat', 'boats', 'vehicles-boats');

notify pgrst, 'reload schema';
