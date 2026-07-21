-- HGN Website Supabase Schema
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'contributor' check (role in ('admin','editor','contributor')),
  created_at timestamptz default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body text not null,
  category text not null default 'Local News',
  status text not null default 'draft' check (status in ('draft','submitted','published','archived')),
  featured boolean default false,
  cover_image_url text,
  video_url text,
  author_id uuid references profiles(id),
  author_name text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  town text,
  email text not null,
  letter text not null,
  status text not null default 'new' check (status in ('new','reviewing','approved','rejected','published')),
  created_at timestamptz default now()
);

create table if not exists classifieds (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  price text,
  contact_name text not null,
  contact_email text not null,
  phone text,
  image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','sold','expired')),
  created_at timestamptz default now()
);

create table if not exists ad_requests (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  ad_type text not null,
  run_dates text,
  budget text,
  notes text,
  artwork_url text,
  status text not null default 'new' check (status in ('new','quoted','approved','invoiced','complete')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table articles enable row level security;
alter table letters_to_editor enable row level security;
alter table classifieds enable row level security;
alter table ad_requests enable row level security;

create policy "Profiles readable signed in" on profiles for select to authenticated using (true);
create policy "Users insert own profile" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update to authenticated using (auth.uid() = id);

create policy "Published articles public" on articles for select using (status='published' or auth.uid() = author_id or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "Contributors create articles" on articles for insert to authenticated with check (auth.uid() = author_id);
create policy "Authors and editors update articles" on articles for update to authenticated using (auth.uid() = author_id or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

create policy "Anyone submit letters" on letters_to_editor for insert with check (true);
create policy "Editors manage letters" on letters_to_editor for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

create policy "Approved classifieds public" on classifieds for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "Anyone submit classifieds" on classifieds for insert with check (true);
create policy "Editors manage classifieds" on classifieds for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

create policy "Anyone request ads" on ad_requests for insert with check (true);
create policy "Editors manage ad requests" on ad_requests for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

insert into articles (title, slug, excerpt, body, category, status, featured, author_name, published_at) values
('Welcome to the new Haida Gwaii News digital hub','welcome-new-hgn-digital-hub','News from the edge, built for the community.','This starter story shows how articles will appear on the new HGN website. Editors and contributors can replace this with real local coverage, sports, letters, photos and video.','Local News','published',true,'Haida Gwaii News',now()),
('Island sports roundup','island-sports-roundup','A home for local sports coverage across Haida Gwaii.','Use this section for hockey, basketball, soccer, fishing derby updates, school sports and community athletics.','Sports','published',false,'Haida Gwaii News',now())
on conflict (slug) do nothing;

-- Auto-create profile rows when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'contributor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- After creating your editor user in Supabase Auth, run this with your email:
-- update profiles set role = 'editor' where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');

-- HGN v3 community platform tables
create table if not exists lost_found (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'Lost Item',
  title text not null,
  description text not null,
  location text,
  contact_name text not null,
  contact_email text not null,
  phone text,
  image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','resolved')),
  created_at timestamptz default now()
);

create table if not exists live_map_items (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text,
  area text,
  latitude numeric,
  longitude numeric,
  status text not null default 'active',
  created_at timestamptz default now()
);

create table if not exists business_directory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  phone text,
  email text,
  website text,
  address text,
  hours text,
  premium boolean default false,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists local_deals (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  title text not null,
  details text,
  expires_at date,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  business_name text,
  location text,
  description text,
  apply_url text,
  contact_email text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notice text not null,
  service_details text,
  photo_url text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table lost_found enable row level security;
alter table live_map_items enable row level security;
alter table business_directory enable row level security;
alter table local_deals enable row level security;
alter table jobs enable row level security;
alter table obituaries enable row level security;

create policy "Approved lost found public" on lost_found for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "Anyone submit lost found" on lost_found for insert with check (true);
create policy "Editors manage lost found" on lost_found for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

create policy "Active map items public" on live_map_items for select using (status='active' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "Editors manage map items" on live_map_items for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

create policy "Approved business directory public" on business_directory for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "Approved deals public" on local_deals for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "Approved jobs public" on jobs for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "Approved obituaries public" on obituaries for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
