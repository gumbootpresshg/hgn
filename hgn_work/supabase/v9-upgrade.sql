-- HGN v9 upgrade
-- Fixes the profiles RLS recursion error and adds new community/weather hub tables.

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'contributor',
  created_at timestamptz default now()
);

alter table user_roles enable row level security;

drop policy if exists "Anyone can read roles" on user_roles;
drop policy if exists "Authenticated users can read roles" on user_roles;
create policy "Authenticated users can read roles"
on user_roles
for select
to authenticated
using (true);

-- Stop recursive policies on profiles. The app now checks user_roles for admin/editor access.
drop policy if exists "Admins can read all profiles" on profiles;
drop policy if exists "Editors manage profiles" on profiles;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Profiles are readable by authenticated users" on profiles;
drop policy if exists "Authenticated users can read profiles" on profiles;

alter table profiles enable row level security;

create policy "Users can read own profile"
on profiles for select to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Authenticated users can read profiles"
on profiles for select to authenticated
using (true);

create table if not exists community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date text,
  location text,
  contact_name text,
  contact_email text,
  description text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists photo_submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  caption text,
  photo_url text,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists alert_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  severity text default 'info',
  details text,
  status text default 'draft',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table community_events enable row level security;
alter table photo_submissions enable row level security;
alter table alert_posts enable row level security;

drop policy if exists "Public can submit events" on community_events;
create policy "Public can submit events" on community_events for insert with check (true);
drop policy if exists "Public can submit photos" on photo_submissions;
create policy "Public can submit photos" on photo_submissions for insert with check (true);

drop policy if exists "Public can read approved events" on community_events;
create policy "Public can read approved events" on community_events for select using (status in ('approved','published'));
drop policy if exists "Public can read featured photos" on photo_submissions;
create policy "Public can read featured photos" on photo_submissions for select using (status in ('approved','featured'));
drop policy if exists "Public can read published alerts" on alert_posts;
create policy "Public can read published alerts" on alert_posts for select using (status='published');

-- For early development: authenticated HGN staff can manage these rows from /admin.
drop policy if exists "Authenticated staff can manage events" on community_events;
create policy "Authenticated staff can manage events" on community_events for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated staff can manage photos" on photo_submissions;
create policy "Authenticated staff can manage photos" on photo_submissions for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated staff can manage alerts" on alert_posts;
create policy "Authenticated staff can manage alerts" on alert_posts for all to authenticated using (true) with check (true);

-- Make sure Vince is admin if this email is used.
insert into user_roles (email, role)
values ('brzostowski@gmail.com', 'admin')
on conflict (email) do update set role = 'admin';
