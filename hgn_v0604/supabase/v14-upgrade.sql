-- HGN v14 upgrade: ad placements + navigation cleanup support

create table if not exists ad_placements (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  title text not null,
  description text,
  placement text not null,
  size text default 'banner',
  image_url text,
  alt_text text,
  click_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer default 0,
  status text default 'active',
  created_at timestamptz default now()
);

alter table ad_placements enable row level security;
drop policy if exists "Public can read active ads" on ad_placements;
drop policy if exists "Authenticated can manage ads" on ad_placements;

create policy "Public can read active ads"
on ad_placements for select
using (
  status = 'active'
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "Authenticated can manage ads"
on ad_placements for all
to authenticated
using (true)
with check (true);

-- Starter house ads so placements are visible immediately.
insert into ad_placements (business_name, title, description, placement, size, click_url, priority, status)
values
('Haida Gwaii News', 'Advertise in print and online', 'Book print ads, digital banners, sponsored stories and marketplace placements with HGN.', 'homepage_leaderboard', 'leaderboard', '/advertise', 10, 'active'),
('Haida Gwaii News', 'Your business card here', 'A small-business placement for local services, restaurants and shops.', 'homepage_sidebar', 'business_card', '/advertise', 10, 'active'),
('Haida Gwaii News', 'Reach local readers here', 'Article-bottom ad placement for businesses that want visibility beside local journalism.', 'article_bottom', 'banner', '/advertise', 10, 'active'),
('Haida Gwaii News', 'Sponsor Games & Puzzles', 'A strong fit for family-friendly local advertisers.', 'games_top', 'leaderboard', '/advertise', 10, 'active'),
('Haida Gwaii News', 'Games sponsor spot', 'Business-card size sponsor space for the games page.', 'games_bottom', 'business_card', '/advertise', 10, 'active'),
('Haida Gwaii News', 'Marketplace sponsor', 'Promote services, rentals, equipment, local crafts and more.', 'marketplace_top', 'leaderboard', '/advertise', 10, 'active')
on conflict do nothing;

-- Make live map upgrades idempotent for older installs that already had this table.
alter table live_map_items add column if not exists lat double precision;
alter table live_map_items add column if not exists lng double precision;
alter table live_map_items add column if not exists area text;
alter table live_map_items add column if not exists type text;
alter table live_map_items add column if not exists details text;
alter table live_map_items add column if not exists status text default 'pending';

-- Keep profile policies from older builds from causing recursion.
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'profiles') then
    alter table profiles disable row level security;
  end if;
end $$;
