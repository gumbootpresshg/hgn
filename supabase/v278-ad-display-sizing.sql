-- HGN Public v0.60.0: editorial ad display sizing controls.
-- Safe/idempotent. Run against the PUBLIC HGN Supabase project only.

alter table public.ads add column if not exists display_mode text default 'recommended';
alter table public.ads add column if not exists max_width_px integer;

update public.ads
set display_mode = 'recommended'
where display_mode is null or btrim(display_mode) = '';
