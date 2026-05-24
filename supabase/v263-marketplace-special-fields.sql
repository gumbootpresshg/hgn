-- HGN v263 - Marketplace special fields
-- Safe to run more than once. Adds fields used by the enhanced marketplace posting form.

alter table public.classifieds add column if not exists employment_type text;
alter table public.classifieds add column if not exists rate_of_pay text;
alter table public.classifieds add column if not exists property_type text;
alter table public.classifieds add column if not exists property_address text;
alter table public.classifieds add column if not exists bedrooms text;
alter table public.classifieds add column if not exists bathrooms text;
alter table public.classifieds add column if not exists square_feet text;
alter table public.classifieds add column if not exists lot_size text;
alter table public.classifieds add column if not exists make text;
alter table public.classifieds add column if not exists model text;
alter table public.classifieds add column if not exists year text;
alter table public.classifieds add column if not exists mileage text;
alter table public.classifieds add column if not exists transmission text;
alter table public.classifieds add column if not exists colour text;
alter table public.classifieds add column if not exists listing_type text;
alter table public.classifieds add column if not exists photo_urls text[] default '{}';

notify pgrst, 'reload schema';
