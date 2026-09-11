-- HGN v0.52.0: Guide Keeper, sourced guide records and review queue
-- Run once after v270.

create table if not exists public.hgn_guide_places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  community text not null,
  latitude double precision,
  longitude double precision,
  description text,
  address text,
  phone text,
  website text,
  hours text,
  amenities text[] not null default '{}',
  caution text,
  featured boolean not null default false,
  published boolean not null default true,
  source_name text,
  source_url text,
  source_type text not null default 'official',
  verified_at timestamptz,
  next_review_at date,
  last_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hgn_guide_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  category text,
  community text,
  source_type text not null default 'official',
  check_frequency_days integer not null default 30,
  active boolean not null default true,
  last_checked_at timestamptz,
  last_http_status integer,
  last_content_hash text,
  last_changed_at timestamptz,
  last_status text not null default 'never_checked',
  last_error text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hgn_guide_findings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.hgn_guide_sources(id) on delete cascade,
  place_id uuid references public.hgn_guide_places(id) on delete set null,
  title text not null,
  summary text,
  proposed_changes jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected','completed')),
  source_url text,
  content_hash text,
  dedupe_key text unique,
  checked_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.hgn_guide_places enable row level security;
alter table public.hgn_guide_sources enable row level security;
alter table public.hgn_guide_findings enable row level security;

drop policy if exists "Public can read published guide places" on public.hgn_guide_places;
create policy "Public can read published guide places" on public.hgn_guide_places for select to anon, authenticated using (published = true);

do $$ declare t text; begin
  foreach t in array array['hgn_guide_places','hgn_guide_sources','hgn_guide_findings'] loop
    execute format('drop policy if exists "HGN guide keeper access" on public.%I', t);
    execute format($p$create policy "HGN guide keeper access" on public.%I for all to authenticated
      using (exists (select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or p.account_type in ('admin','publisher','editor'))))
      with check (exists (select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or p.account_type in ('admin','publisher','editor'))))$p$, t);
  end loop;
end $$;

insert into public.hgn_guide_sources(name,url,category,community,check_frequency_days,notes) values
('BC Ferries schedules','https://www.bcferries.com/routes-fares/schedules','Transportation','Haida Gwaii',7,'Official schedules and route information.'),
('BC Ferries current conditions','https://www.bcferries.com/current-conditions','Transportation','Haida Gwaii',1,'Official sailing status, tracking and terminal conditions.'),
('Naikoon Park','https://bcparks.ca/naikoon-park/','Campground','North Graham Island',14,'Official park, campground, trail and advisory information.'),
('BC Parks reservations','https://bcparks.ca/reservations/','Campground','Haida Gwaii',30,'Official reservation rules and seasonal booking information.'),
('DriveBC Northern cameras','https://images.drivebc.ca/bchighwaycam/pub/html/www/index-Northern.html','Camera','Haida Gwaii',1,'Official road camera directory.'),
('Haida Heritage Centre','https://haidaheritagecentre.com/','Culture','Skidegate',14,'Official visitor information, programs and hours.'),
('Gwaii Haanas','https://parks.canada.ca/pn-np/bc/gwaiihaanas','Culture','Southern Haida Gwaii',14,'Official Parks Canada visitor, access and safety information.'),
('Village of Masset','https://massetbc.com/','Essential Service','Masset',30,'Official community services and visitor information.'),
('Village of Daajing Giids','https://daajinggiids.ca/','Essential Service','Daajing Giids',30,'Official community services and notices.'),
('Northern Health facilities','https://www.northernhealth.ca/locations','Essential Service','Haida Gwaii',30,'Official health facility directory.')
on conflict (url) do nothing;

insert into public.hgn_guide_places(slug,name,category,community,latitude,longitude,description,website,phone,amenities,caution,featured,source_name,source_url,verified_at,next_review_at) values
('north-beach','North Beach','Beach','North Graham Island',54.072,-131.915,'Long ocean beach north of Masset with broad views and vehicle access only when conditions allow.',null,null,array['Beach access','Scenic views'],'Check tides, weather and beach-driving conditions before entering.',true,'BC Parks','https://bcparks.ca/naikoon-park/',now(),current_date+30),
('agate-beach','Agate Beach','Beach','North Graham Island',54.045,-131.93,'Popular north-end beach near Tow Hill in Naikoon Park. Check official park information before travel.',null,null,array['Parking','Beach access','Nearby campground'],'Ocean conditions can change quickly.',true,'BC Parks','https://bcparks.ca/naikoon-park/',now(),current_date+30),
('tow-hill','Tow Hill Trail','Viewpoint','North Graham Island',54.073,-131.82,'Boardwalk and trail access to forest, river and elevated coastal viewpoints.',null,null,array['Trail','Boardwalk','Scenic views'],'Follow posted closures and current park advisories.',true,'BC Parks','https://bcparks.ca/naikoon-park/',now(),current_date+30),
('haida-heritage-centre','Haida Heritage Centre at Kay Llnagaay','Culture','Skidegate',53.244,-131.993,'A major cultural centre sharing Haida history, art, knowledge and living culture. Confirm current hours before visiting.','https://haidaheritagecentre.com/',null,array['Museum','Cultural centre','Gift shop'],null,true,'Haida Heritage Centre','https://haidaheritagecentre.com/',now(),current_date+14),
('skidegate-terminal','Skidegate Ferry Terminal','Transportation','Skidegate',53.266,-132.008,'Terminal for the Prince Rupert and Alliford Bay ferry services. Check live conditions before travel.','https://www.bcferries.com/current-conditions','1-888-223-3779',array['Ferry terminal','Vehicle check-in'],null,true,'BC Ferries','https://www.bcferries.com/current-conditions',now(),current_date+7),
('alliford-terminal','Alliford Bay Ferry Terminal','Transportation','Moresby Island',53.188,-131.989,'Moresby Island terminal for the inter-island ferry to Skidegate. Check live conditions before travel.','https://www.bcferries.com/current-conditions','1-888-223-3779',array['Ferry terminal'],null,false,'BC Ferries','https://www.bcferries.com/current-conditions',now(),current_date+7),
('naikoon-campground','Agate Beach Campground','Campground','North Graham Island',54.045,-131.925,'Provincial campground near Agate Beach and Tow Hill. Availability and reservation rules are seasonal.','https://bcparks.ca/naikoon-park/',null,array['Camping','Beach access'],'Check current operating dates and reservation requirements.',false,'BC Parks','https://bcparks.ca/naikoon-park/',now(),current_date+14)
on conflict (slug) do update set source_name=excluded.source_name,source_url=excluded.source_url,verified_at=excluded.verified_at,next_review_at=excluded.next_review_at;
