-- HGN v39 Events + Classifieds Cleanup

create extension if not exists pgcrypto;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text default 'Community',
  town text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  contact_name text,
  contact_email text,
  contact_phone text,
  image_url text,
  featured boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table events add column if not exists category text default 'Community';
alter table events add column if not exists town text;
alter table events add column if not exists location text;
alter table events add column if not exists starts_at timestamptz;
alter table events add column if not exists ends_at timestamptz;
alter table events add column if not exists contact_name text;
alter table events add column if not exists contact_email text;
alter table events add column if not exists contact_phone text;
alter table events add column if not exists image_url text;
alter table events add column if not exists featured boolean default false;
alter table events add column if not exists status text default 'pending';
alter table events add column if not exists created_at timestamptz default now();
alter table events add column if not exists updated_at timestamptz default now();

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notice text,
  category text default 'Notice',
  town text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text default 'pending',
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table notices add column if not exists title text;
alter table notices add column if not exists notice text;
alter table notices add column if not exists category text default 'Notice';
alter table notices add column if not exists town text;
alter table notices add column if not exists contact_name text;
alter table notices add column if not exists contact_email text;
alter table notices add column if not exists contact_phone text;
alter table notices add column if not exists status text default 'pending';
alter table notices add column if not exists published_at timestamptz;
alter table notices add column if not exists created_at timestamptz default now();

insert into events (title, description, category, town, location, starts_at, status, featured)
values
('Community event submissions now open', 'Submit community events for editor approval and possible publication in print and online.', 'Community', 'Haida Gwaii', 'Online', now() + interval '1 day', 'published', true),
('This weekend on Haida Gwaii', 'Use the events calendar to promote markets, meetings, sports, music, school events and community gatherings.', 'Community', 'Haida Gwaii', 'Various locations', now() + interval '3 days', 'published', true)
on conflict do nothing;
