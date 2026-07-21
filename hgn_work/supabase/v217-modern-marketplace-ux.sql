-- HGN v217 - Modern Marketplace UX
-- Adds grouped categories, filtering fields and multi-photo support.
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
  ('marketplace_category', 'Vehicles & Boats', 'vehicles-boats', 10, true),
  ('marketplace_category', 'Real Estate', 'real-estate', 20, true),
  ('marketplace_category', 'Rentals', 'rentals', 30, true),
  ('marketplace_category', 'Jobs', 'jobs', 40, true),
  ('marketplace_category', 'Services', 'services', 50, true),
  ('marketplace_category', 'Home', 'home', 110, true),
  ('marketplace_category', 'Electronics', 'electronics', 120, true),
  ('marketplace_category', 'Clothing & Fashion', 'clothing-fashion', 130, true),
  ('marketplace_category', 'Kids & Baby', 'kids-baby', 140, true),
  ('marketplace_category', 'Sports & Outdoors', 'sports-outdoors', 150, true),
  ('marketplace_category', 'Health & Wellness', 'health-wellness', 160, true),
  ('marketplace_category', 'Hobbies, Music & Collectibles', 'hobbies-music-collectibles', 170, true),
  ('marketplace_category', 'Antiques & Vintage', 'antiques-vintage', 180, true),
  ('marketplace_category', 'Pets', 'pets', 190, true),
  ('marketplace_category', 'Free Stuff', 'free-stuff', 200, true),
  ('marketplace_category', 'Tickets & Events', 'tickets-events', 310, true),
  ('marketplace_category', 'Notices', 'notices', 320, true),
  ('marketplace_category', 'Farm & Industrial', 'farm-industrial', 330, true)
on conflict (setting_type, slug) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now();

alter table public.classifieds add column if not exists category text default 'home';
alter table public.classifieds add column if not exists condition text;
alter table public.classifieds add column if not exists delivery_available boolean default false;
alter table public.classifieds add column if not exists photos text[] default '{}';
alter table public.classifieds add column if not exists image_url text;
alter table public.classifieds add column if not exists title text;
alter table public.classifieds add column if not exists description text;
alter table public.classifieds add column if not exists price text;
alter table public.classifieds add column if not exists town text;
alter table public.classifieds add column if not exists location text;
alter table public.classifieds add column if not exists status text default 'pending';
alter table public.classifieds add column if not exists is_featured boolean default false;
alter table public.classifieds add column if not exists listing_type text;
alter table public.classifieds add column if not exists created_at timestamptz default now();
alter table public.classifieds add column if not exists updated_at timestamptz default now();

update public.classifieds
set category = case
  when lower(coalesce(category, listing_type, '')) in ('marketplace', 'for-sale', 'for sale', 'buy sell', 'buy-sell') then 'home'
  when lower(coalesce(category, listing_type, '')) in ('vehicle', 'vehicles', 'boat', 'boats', 'vehicles-boats') then 'vehicles-boats'
  when lower(coalesce(category, listing_type, '')) in ('home-sale', 'home sale', 'realty', 'real estate', 'real-estate') then 'real-estate'
  when lower(coalesce(category, listing_type, '')) in ('rental', 'rentals') then 'rentals'
  when lower(coalesce(category, listing_type, '')) in ('free', 'free stuff', 'free-stuff') then 'free-stuff'
  when lower(coalesce(category, listing_type, '')) in ('notice', 'notices', 'community', 'notices') then 'notices'
  else coalesce(nullif(category, ''), 'home')
end,
town = coalesce(nullif(town, ''), nullif(location, ''), 'Island-wide'),
status = coalesce(nullif(status, ''), 'pending'),
photos = case
  when photos is null or cardinality(photos) = 0 then array_remove(array[image_url], null)
  else photos
end,
updated_at = now()
where category is null
   or category = ''
   or town is null
   or town = ''
   or status is null
   or status = ''
   or photos is null;

create index if not exists idx_classifieds_marketplace_filters
on public.classifieds (status, category, town, is_featured, created_at desc);

notify pgrst, 'reload schema';
