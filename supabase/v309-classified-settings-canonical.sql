-- HGN v0.67.21 - Make Classified Settings the single source for public filters.
-- Safe to run once or repeatedly. Existing Marketplace Settings rows are copied in
-- so they can be managed from /admin/classifieds/settings.

insert into public.classified_settings (setting_type, label, slug, sort_order, is_active)
select
  'town',
  trim(name),
  lower(regexp_replace(trim(name), '[^a-z0-9]+', '-', 'g')),
  coalesce(sort_order, 100),
  coalesce(is_active, true)
from public.marketplace_towns
where nullif(trim(name), '') is not null
on conflict (setting_type, slug) do nothing;

insert into public.classified_settings (setting_type, label, slug, sort_order, is_active)
select
  'marketplace_category',
  trim(name),
  lower(regexp_replace(trim(name), '[^a-z0-9]+', '-', 'g')),
  coalesce(sort_order, 100),
  coalesce(is_active, true)
from public.marketplace_categories
where nullif(trim(name), '') is not null
on conflict (setting_type, slug) do nothing;

notify pgrst, 'reload schema';
