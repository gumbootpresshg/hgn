-- HGN v15 upgrade: alerts, ad click analytics, digital paper, notices, marketplace upgrades

create table if not exists site_alerts (
  id uuid primary key default gen_random_uuid(),
  label text default 'BREAKING',
  kind text default 'breaking',
  message text not null,
  url text,
  priority integer default 5,
  status text default 'active',
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists ad_click_events (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid,
  user_agent text,
  created_at timestamp with time zone default now()
);

alter table ad_placements add column if not exists title text;
alter table ad_placements add column if not exists alt_text text;
alter table ad_placements add column if not exists description text;
alter table ad_placements add column if not exists business_name text;
alter table ad_placements add column if not exists priority integer default 0;
alter table ad_placements add column if not exists starts_at timestamp with time zone;
alter table ad_placements add column if not exists ends_at timestamp with time zone;

create table if not exists digital_editions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issue_date date,
  description text,
  cover_image_url text,
  pdf_url text,
  flipbook_url text,
  status text default 'draft',
  created_at timestamp with time zone default now()
);

create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  notice_type text default 'obituary',
  name text not null,
  body text,
  service_details text,
  photo_url text,
  status text default 'pending',
  published_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table classifieds add column if not exists is_featured boolean default false;
alter table classifieds add column if not exists featured_until timestamp with time zone;
alter table classifieds add column if not exists location text;
alter table classifieds add column if not exists image_url text;
alter table classifieds add column if not exists phone text;
alter table classifieds add column if not exists contact_email text;

alter table articles add column if not exists excerpt text;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists imported_from text;
alter table articles add column if not exists wordpress_id text;

alter table site_alerts enable row level security;
alter table ad_click_events enable row level security;
alter table digital_editions enable row level security;
alter table obituaries enable row level security;

drop policy if exists "Anyone can read active alerts" on site_alerts;
create policy "Anyone can read active alerts" on site_alerts for select using (true);
drop policy if exists "Authenticated can manage alerts" on site_alerts;
create policy "Authenticated can manage alerts" on site_alerts for all to authenticated using (true) with check (true);

drop policy if exists "Anyone can insert ad clicks" on ad_click_events;
create policy "Anyone can insert ad clicks" on ad_click_events for insert with check (true);
drop policy if exists "Authenticated can read ad clicks" on ad_click_events;
create policy "Authenticated can read ad clicks" on ad_click_events for select to authenticated using (true);

drop policy if exists "Anyone can read editions" on digital_editions;
create policy "Anyone can read editions" on digital_editions for select using (true);
drop policy if exists "Authenticated can manage editions" on digital_editions;
create policy "Authenticated can manage editions" on digital_editions for all to authenticated using (true) with check (true);

drop policy if exists "Anyone can read notices" on obituaries;
create policy "Anyone can read notices" on obituaries for select using (true);
drop policy if exists "Authenticated can manage notices" on obituaries;
create policy "Authenticated can manage notices" on obituaries for all to authenticated using (true) with check (true);

insert into site_alerts (label, kind, message, url, priority, status)
values ('HGN', 'community', 'Welcome to the new Haida Gwaii News digital platform.', '/', 1, 'paused')
on conflict do nothing;
