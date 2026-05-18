-- HGN v193 - Ad Upload + Rotation + Size Guide
-- Adds ad image upload bucket, rotation controls, and placement size guidance.
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.ads add column if not exists rotation_weight integer default 1;
alter table public.ads add column if not exists uploaded_path text;
alter table public.ads add column if not exists file_size_bytes bigint;
alter table public.ads add column if not exists image_width integer;
alter table public.ads add column if not exists image_height integer;

alter table public.ad_placements add column if not exists recommended_width integer;
alter table public.ad_placements add column if not exists recommended_height integer;
alter table public.ad_placements add column if not exists mobile_width integer;
alter table public.ad_placements add column if not exists mobile_height integer;
alter table public.ad_placements add column if not exists size_notes text;
alter table public.ad_placements add column if not exists rotation_enabled boolean default true;
alter table public.ad_placements add column if not exists max_file_size_mb integer default 2;

update public.ad_placements
set recommended_width = case placement_key
  when 'site_top' then 1200
  when 'home_middle' then 970
  when 'home_sidebar' then 300
  when 'article_top' then 970
  when 'article_bottom' then 970
  when 'classifieds_top' then 970
  when 'real_estate_top' then 970
  when 'events_top' then 970
  else coalesce(recommended_width, 970)
end,
recommended_height = case placement_key
  when 'site_top' then 250
  when 'home_middle' then 250
  when 'home_sidebar' then 250
  when 'article_top' then 250
  when 'article_bottom' then 250
  when 'classifieds_top' then 250
  when 'real_estate_top' then 250
  when 'events_top' then 250
  else coalesce(recommended_height, 250)
end,
mobile_width = coalesce(mobile_width, 640),
mobile_height = coalesce(mobile_height, 180),
size_notes = coalesce(size_notes, 'Upload WebP, JPG, PNG, or GIF. Keep under 2MB when possible. Larger images will work but may slow pages.'),
rotation_enabled = coalesce(rotation_enabled, true),
max_file_size_mb = coalesce(max_file_size_mb, 2),
updated_at = now()
where placement_key is not null;

update public.ads
set rotation_weight = coalesce(rotation_weight, 1),
    updated_at = now()
where rotation_weight is null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hgn-ads',
  'hgn-ads',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "hgn_ads_public_read" on storage.objects;
create policy "hgn_ads_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'hgn-ads');

drop policy if exists "hgn_ads_authenticated_insert" on storage.objects;
create policy "hgn_ads_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'hgn-ads');

drop policy if exists "hgn_ads_authenticated_update" on storage.objects;
create policy "hgn_ads_authenticated_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'hgn-ads')
with check (bucket_id = 'hgn-ads');

drop policy if exists "hgn_ads_authenticated_delete" on storage.objects;
create policy "hgn_ads_authenticated_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'hgn-ads');

create index if not exists idx_ads_rotation
on public.ads (placement_key, status, rotation_weight, start_date, end_date);
