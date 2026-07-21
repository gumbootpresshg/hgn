-- HGN v31 Demo Ready cleanup
-- Run in Supabase SQL Editor.

alter table articles add column if not exists section text;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists cover_image_url text;
alter table articles add column if not exists status text default 'published';
alter table articles add column if not exists author_name text;
alter table articles add column if not exists category text;

update articles
set category = 'Letters to the Editor', section = 'Letters to the Editor'
where coalesce(category,'') ilike '%letter%' or coalesce(section,'') ilike '%letter%';

update articles
set section = category
where section is null and category is not null;

with newest as (
  select id from articles
  where status = 'published'
  order by published_at desc nulls last, created_at desc nulls last
  limit 1
)
update articles set front_page_main = true
where id in (select id from newest)
and not exists (select 1 from articles where front_page_main = true);

with recent as (
  select id from articles
  where status = 'published'
  order by published_at desc nulls last, created_at desc nulls last
  limit 6
)
update articles set featured = true
where id in (select id from recent)
and not exists (select 1 from articles where featured = true);

create table if not exists letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  town text,
  title text,
  letter text,
  body text,
  status text default 'new',
  created_at timestamptz default now()
);

alter table letters_to_editor add column if not exists title text;
alter table letters_to_editor add column if not exists town text;
alter table letters_to_editor add column if not exists status text default 'new';
alter table letters_to_editor add column if not exists body text;

create table if not exists marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  sort_order int default 100,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists towns (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  sort_order int default 100,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into towns (name, sort_order) values
('Masset', 10), ('Old Massett', 20), ('Port Clements', 30), ('Tlell', 40),
('Skidegate', 50), ('Daajing Giids', 60), ('Sandspit', 70), ('Tow Hill', 80), ('Other', 100)
on conflict (name) do nothing;

insert into marketplace_categories (name, sort_order) values
('Vehicles', 10), ('Rentals', 20), ('Jobs', 30), ('Services', 40), ('Equipment', 50),
('Firewood', 60), ('Fishing Gear', 70), ('Local Crafts', 80), ('Lost & Found', 90), ('Free', 100)
on conflict (name) do nothing;

create table if not exists live_map_items (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text,
  area text,
  lat double precision,
  lng double precision,
  details text,
  status text default 'approved',
  created_at timestamptz default now()
);

alter table live_map_items add column if not exists lat double precision;
alter table live_map_items add column if not exists lng double precision;
alter table live_map_items add column if not exists status text default 'approved';

insert into live_map_items (type, title, area, lat, lng, details, status)
values
('event', 'Community event', 'Masset', 54.0130, -132.1500, 'Demo event marker for Masset.', 'approved'),
('event', 'Market day', 'Daajing Giids', 53.2546, -132.0838, 'Demo community marker for Daajing Giids.', 'approved'),
('alert', 'Weather watch', 'Tlell', 53.5590, -131.9400, 'Demo weather marker for central Haida Gwaii.', 'approved'),
('classified', 'Garage sale', 'Skidegate', 53.2660, -131.9900, 'Demo marketplace marker for Skidegate.', 'approved'),
('travel', 'Visitor notice', 'Sandspit', 53.2420, -131.8130, 'Demo travel marker for Sandspit.', 'approved')
on conflict do nothing;

create table if not exists ad_placements (
  id uuid primary key default gen_random_uuid(),
  placement text not null,
  advertiser_name text,
  title text,
  subtitle text,
  image_url text,
  click_url text,
  starts_at date,
  ends_at date,
  is_active boolean default true,
  priority int default 100,
  created_at timestamptz default now()
);
