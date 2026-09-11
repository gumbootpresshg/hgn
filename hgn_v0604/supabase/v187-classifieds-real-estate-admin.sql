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

create unique index if not exists idx_classified_settings_type_slug on public.classified_settings (setting_type, slug);

insert into public.classified_settings (setting_type, label, slug, sort_order, is_active)
values
  ('town', 'Masset', 'masset', 10, true),
  ('town', 'Old Massett', 'old-massett', 20, true),
  ('town', 'Port Clements', 'port-clements', 30, true),
  ('town', 'Tlell', 'tlell', 40, true),
  ('town', 'Skidegate', 'skidegate', 50, true),
  ('town', 'Daajing Giids', 'daajing-giids', 60, true),
  ('town', 'Sandspit', 'sandspit', 70, true),
  ('town', 'Island-wide', 'island-wide', 80, true),
  ('classified_category', 'For Sale', 'for-sale', 10, true),
  ('classified_category', 'Wanted', 'wanted', 20, true),
  ('classified_category', 'Free', 'free', 30, true),
  ('classified_category', 'Services', 'services', 40, true),
  ('real_estate_type', 'Home Sale', 'home-sale', 10, true),
  ('real_estate_type', 'Rental', 'rental', 20, true),
  ('real_estate_type', 'Wanted Rental', 'wanted-rental', 30, true)
on conflict (setting_type, slug) do update
set label = excluded.label, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

alter table public.classifieds add column if not exists title text;
alter table public.classifieds add column if not exists description text;
alter table public.classifieds add column if not exists category text default 'marketplace';
alter table public.classifieds add column if not exists location text;
alter table public.classifieds add column if not exists town text;
alter table public.classifieds add column if not exists price text;
alter table public.classifieds add column if not exists contact_name text;
alter table public.classifieds add column if not exists contact_email text;
alter table public.classifieds add column if not exists phone text;
alter table public.classifieds add column if not exists image_url text;
alter table public.classifieds add column if not exists status text default 'pending';
alter table public.classifieds add column if not exists admin_notes text;
alter table public.classifieds add column if not exists is_featured boolean default false;
alter table public.classifieds add column if not exists listing_type text;
alter table public.classifieds add column if not exists bedrooms text;
alter table public.classifieds add column if not exists bathrooms text;
alter table public.classifieds add column if not exists square_feet text;
alter table public.classifieds add column if not exists property_address text;
alter table public.classifieds add column if not exists map_url text;
alter table public.classifieds add column if not exists latitude numeric;
alter table public.classifieds add column if not exists longitude numeric;
alter table public.classifieds add column if not exists created_at timestamptz default now();
alter table public.classifieds add column if not exists updated_at timestamptz default now();

update public.classifieds
set town = coalesce(nullif(town, ''), nullif(location, ''), 'Island-wide'),
    status = coalesce(nullif(status, ''), 'pending'),
    updated_at = now()
where town is null or town = '' or status is null or status = '';

alter table public.classifieds enable row level security;
alter table public.classified_settings enable row level security;

drop policy if exists "classifieds_public_read_approved" on public.classifieds;
create policy "classifieds_public_read_approved" on public.classifieds
for select to anon, authenticated
using (lower(coalesce(status, '')) in ('approved', 'published', 'public', 'live', 'active'));

drop policy if exists "classifieds_public_insert" on public.classifieds;
create policy "classifieds_public_insert" on public.classifieds
for insert to anon, authenticated with check (true);

drop policy if exists "classifieds_authenticated_manage" on public.classifieds;
create policy "classifieds_authenticated_manage" on public.classifieds
for all to authenticated using (true) with check (true);

drop policy if exists "classified_settings_public_read" on public.classified_settings;
create policy "classified_settings_public_read" on public.classified_settings
for select to anon, authenticated using (is_active = true);

drop policy if exists "classified_settings_authenticated_manage" on public.classified_settings;
create policy "classified_settings_authenticated_manage" on public.classified_settings
for all to authenticated using (true) with check (true);

create index if not exists idx_classifieds_status_category_town on public.classifieds (status, category, town, created_at desc);
create index if not exists idx_classifieds_real_estate on public.classifieds (category, listing_type, town, status, created_at desc);
