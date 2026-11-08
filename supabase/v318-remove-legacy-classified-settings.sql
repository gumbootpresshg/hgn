-- HGN v0.67.49 - Retire old classified category settings.
-- The current Marketplace uses marketplace_category only.
-- This removes old admin configuration records, not historic listings.

delete from public.classified_settings
where setting_type = 'classified_category';

notify pgrst, 'reload schema';
