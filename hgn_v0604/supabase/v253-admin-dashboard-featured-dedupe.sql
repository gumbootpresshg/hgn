-- HGN v253 - Admin Dashboard Link + Featured Article Controls
-- Safe to rerun.

alter table public.articles add column if not exists is_featured boolean default false;
alter table public.articles add column if not exists featured boolean default false;
alter table public.articles add column if not exists featured_at timestamptz;
alter table public.articles add column if not exists updated_at timestamptz default now();

notify pgrst, 'reload schema';
