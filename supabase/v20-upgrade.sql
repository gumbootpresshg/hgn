-- HGN v20 Visitor Guide working upgrade
create extension if not exists pgcrypto;

create table if not exists ad_placements (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Haida Gwaii News',
  title text not null default 'Advertise with HGN',
  description text,
  placement text not null default 'general',
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


create table if not exists visitor_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  category text default 'Explore',
  town text default 'Island-wide',
  address text,
  phone text,
  email text,
  website text,
  hours text,
  description text,
  image_url text,
  submitter_name text,
  submitter_email text,
  featured boolean default false,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table visitor_listings add column if not exists slug text;
alter table visitor_listings add column if not exists category text default 'Explore';
alter table visitor_listings add column if not exists town text default 'Island-wide';
alter table visitor_listings add column if not exists address text;
alter table visitor_listings add column if not exists phone text;
alter table visitor_listings add column if not exists email text;
alter table visitor_listings add column if not exists website text;
alter table visitor_listings add column if not exists hours text;
alter table visitor_listings add column if not exists description text;
alter table visitor_listings add column if not exists image_url text;
alter table visitor_listings add column if not exists submitter_name text;
alter table visitor_listings add column if not exists submitter_email text;
alter table visitor_listings add column if not exists featured boolean default false;
alter table visitor_listings add column if not exists status text default 'pending';
alter table visitor_listings add column if not exists updated_at timestamptz default now();

create unique index if not exists visitor_listings_slug_idx on visitor_listings(slug);
create index if not exists visitor_listings_status_idx on visitor_listings(status);
create index if not exists visitor_listings_town_idx on visitor_listings(town);
create index if not exists visitor_listings_category_idx on visitor_listings(category);

alter table visitor_listings enable row level security;
drop policy if exists "Public can read approved visitor listings" on visitor_listings;
drop policy if exists "Anyone can submit visitor listings" on visitor_listings;
drop policy if exists "Authenticated can manage visitor listings" on visitor_listings;

create policy "Public can read approved visitor listings"
on visitor_listings for select
using (status in ('approved','published'));

create policy "Anyone can submit visitor listings"
on visitor_listings for insert
with check (status = 'pending');

create policy "Authenticated can manage visitor listings"
on visitor_listings for all
to authenticated
using (true)
with check (true);

insert into visitor_listings (title, slug, category, town, description, hours, website, featured, status)
values
('BC Ferries Travel Notes', 'bc-ferries-travel-notes', 'Transportation', 'Island-wide', 'Helpful travel links and notes for ferry planning, delays, cancellations and getting between communities.', 'Check current sailing information before travel.', 'https://www.bcferries.com/', true, 'published'),
('Visitor Emergency Contacts', 'visitor-emergency-contacts', 'Emergency', 'Island-wide', 'A quick reference listing for emergency services, health care, safety contacts and urgent community information.', 'For emergencies call 911.', null, true, 'published'),
('Haida Gwaii Weather and Marine Conditions', 'weather-and-marine-conditions', 'Services', 'Island-wide', 'Town forecasts, wind, rainfall, marine notes and weather maps for residents and visitors.', 'Updated live on the HGN weather page.', null, true, 'published'),
('Eat Local Around Haida Gwaii', 'eat-local-around-haida-gwaii', 'Eat', 'Island-wide', 'Restaurants, cafés, takeout, grocery stops and local food specials can be submitted here for editor review.', 'Hours vary by season.', null, false, 'published'),
('Beaches, Trails and Outdoor Stops', 'beaches-trails-and-outdoor-stops', 'Explore', 'Island-wide', 'A growing list of beaches, trails, viewpoints and outdoor stops for visitors to explore responsibly.', 'Check local conditions before heading out.', null, false, 'published'),
('Local Shops and Services', 'local-shops-and-services', 'Shops', 'Island-wide', 'A practical guide to shops, repair services, groceries, outfitters and local businesses across the islands.', 'Submit updated hours through HGN.', null, false, 'published')
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  town = excluded.town,
  description = excluded.description,
  hours = excluded.hours,
  website = excluded.website,
  featured = excluded.featured,
  status = excluded.status;

-- Ad slots for guide pages
insert into ad_placements (business_name, title, description, placement, size, click_url, priority, status)
values
('Haida Gwaii News', 'Advertise in the Visitor Guide', 'Reach people planning their trip and locals looking for current island information.', 'visitor_guide_top', 'leaderboard', '/advertise', 5, 'active'),
('Haida Gwaii News', 'Visitor Guide Business Card', 'Sponsor this visitor information page online and in print.', 'visitor_listing_bottom', 'business_card', '/advertise', 5, 'active')
on conflict do nothing;
