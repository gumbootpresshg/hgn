-- HGN v240 - Listing/Poll/Menu Fixes
-- Safe to rerun.

alter table public.classifieds add column if not exists contact_name text default '';
alter table public.classifieds alter column contact_name set default '';

update public.classifieds
set contact_name = coalesce(nullif(contact_name, ''), owner_email, contact_email, 'HGN Marketplace User')
where contact_name is null or contact_name = '';

-- If old imports made this column not-null, keep it satisfied with default.
notify pgrst, 'reload schema';
