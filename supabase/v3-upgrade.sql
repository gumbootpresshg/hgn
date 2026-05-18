-- HGN v3 upgrade only. Safe to run after v1/v2 schema.
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

do $$ begin
  create policy "Approved lost found public" on lost_found for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Anyone submit lost found" on lost_found for insert with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Editors manage lost found" on lost_found for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Active map items public" on live_map_items for select using (status='active' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Editors manage map items" on live_map_items for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Approved business directory public" on business_directory for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Approved deals public" on local_deals for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Approved jobs public" on jobs for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Approved obituaries public" on obituaries for select using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
exception when duplicate_object then null; end $$;
