-- HGN v247 - Admin, Poll, Obituary, Island Lens Fixes
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.obituaries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text,
  tribute text,
  photo_url text,
  birth_date date,
  death_date date,
  community text,
  status text default 'draft',
  print_paid boolean default false,
  web_paid_until date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.obituaries add column if not exists full_name text;
alter table public.obituaries add column if not exists slug text;
alter table public.obituaries add column if not exists tribute text;
alter table public.obituaries add column if not exists photo_url text;
alter table public.obituaries add column if not exists birth_date date;
alter table public.obituaries add column if not exists death_date date;
alter table public.obituaries add column if not exists community text;
alter table public.obituaries add column if not exists status text default 'draft';
alter table public.obituaries add column if not exists print_paid boolean default false;
alter table public.obituaries add column if not exists web_paid_until date;
alter table public.obituaries add column if not exists created_at timestamptz default now();
alter table public.obituaries add column if not exists updated_at timestamptz default now();

create table if not exists public.island_lens_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  media_type text default 'gallery',
  media_url text,
  thumbnail_url text,
  community text,
  credit text,
  status text default 'draft',
  featured boolean default false,
  gallery_intro text,
  gallery_body text,
  photo_urls text[] default '{}',
  video_urls text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.island_lens_items add column if not exists gallery_intro text;
alter table public.island_lens_items add column if not exists gallery_body text;
alter table public.island_lens_items add column if not exists photo_urls text[] default '{}';
alter table public.island_lens_items add column if not exists video_urls text[] default '{}';

-- Poll results support.
alter table public.poll_votes add column if not exists poll_id uuid;
alter table public.poll_votes add column if not exists option_id uuid;
alter table public.poll_votes add column if not exists voter_hash text;
alter table public.poll_votes add column if not exists created_at timestamptz default now();

notify pgrst, 'reload schema';
