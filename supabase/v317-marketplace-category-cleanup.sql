-- HGN v0.67.47 - Clean up the public Marketplace category list.
-- Run once in Supabase SQL Editor. Safe to re-run.
-- Notices belong on the site's main /notices page rather than as a Marketplace category.

-- Keep existing marketplace listings usable under the new canonical labels.
update public.classifieds
set category = 'real-estate'
where lower(coalesce(category, '')) = 'realty';

update public.classifieds
set category = 'tools-equipment'
where lower(coalesce(category, '')) in ('farm-industrial', 'farm', 'industrial', 'tools', 'tool', 'equipment');

-- Remove retired or duplicate categories from the live Marketplace controls.
delete from public.classified_settings
where setting_type = 'marketplace_category'
  and slug in ('realty', 'notices', 'farm-industrial');

-- Ensure each current category has one canonical setting. Existing rows are preserved.
insert into public.classified_settings (setting_type, label, slug, sort_order, is_active)
values
  ('marketplace_category', 'Real Estate', 'real-estate', 20, true),
  ('marketplace_category', 'Tools & Equipment', 'tools-equipment', 115, true)
on conflict (setting_type, slug) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

-- Keep older supporting configuration tables consistent if they are still present.
update public.marketplace_categories
set name = 'Real Estate'
where lower(coalesce(name, '')) = 'realty';

update public.marketplace_categories
set name = 'Tools & Equipment'
where lower(coalesce(name, '')) = 'farm & industrial';

notify pgrst, 'reload schema';
