-- HGN v13 upgrade: working map pins, media buckets, moderation helpers

create table if not exists live_map_items (
  id uuid primary key default gen_random_uuid(),
  type text default 'Community',
  title text not null,
  area text,
  lat double precision,
  lng double precision,
  details text,
  contact_name text,
  contact_email text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table live_map_items enable row level security;
drop policy if exists "Public can read approved live map items" on live_map_items;
drop policy if exists "Anyone can submit live map items" on live_map_items;
drop policy if exists "Authenticated can manage live map items" on live_map_items;

create policy "Public can read approved live map items"
on live_map_items for select
using (status = 'approved');

create policy "Anyone can submit live map items"
on live_map_items for insert
with check (status = 'pending' or status is null);

create policy "Authenticated can manage live map items"
on live_map_items for all
to authenticated
using (true)
with check (true);

insert into live_map_items (type, title, area, lat, lng, details, status)
values
('Breaking', 'Masset local updates', 'Masset', 54.0124, -132.1497, 'Starter town pin for breaking stories and local notices.', 'approved'),
('Community', 'Old Massett notices', 'Old Massett', 54.0372, -132.1824, 'Starter town pin for community updates.', 'approved'),
('Marketplace', 'Port Clements marketplace', 'Port Clements', 53.6886, -132.1853, 'Starter town pin for listings and community exchange items.', 'approved'),
('Weather', 'Tlell weather watch', 'Tlell', 53.5652, -131.9373, 'Starter town pin for weather and outdoor conditions.', 'approved'),
('Ferry', 'Skidegate ferry watch', 'Skidegate', 53.2669, -132.0039, 'Starter town pin for ferry and travel information.', 'approved'),
('Events', 'Daajing Giids events', 'Daajing Giids', 53.2548, -132.0829, 'Starter town pin for events and community meetings.', 'approved'),
('Outdoor', 'Sandspit travel and outdoors', 'Sandspit', 53.2420, -131.8337, 'Starter town pin for flights, outdoors and visitor notes.', 'approved')
on conflict do nothing;

-- Make sure classifieds supports the newer marketplace fields
alter table classifieds add column if not exists location text;
alter table classifieds add column if not exists phone text;
alter table classifieds add column if not exists image_url text;
alter table classifieds add column if not exists price text;
alter table classifieds add column if not exists contact_name text;
alter table classifieds add column if not exists contact_email text;
alter table classifieds add column if not exists status text default 'pending';

-- Storage bucket for phone/photo uploads. Public read keeps marketplace images simple for now.
insert into storage.buckets (id, name, public)
values ('hgn-media', 'hgn-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read HGN media" on storage.objects;
drop policy if exists "Anyone can upload HGN media" on storage.objects;

create policy "Public can read HGN media"
on storage.objects for select
using (bucket_id = 'hgn-media');

create policy "Anyone can upload HGN media"
on storage.objects for insert
with check (bucket_id = 'hgn-media');

-- Keep profile policies simple to avoid recursion from older builds.
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'profiles') then
    alter table profiles disable row level security;
  end if;
end $$;
