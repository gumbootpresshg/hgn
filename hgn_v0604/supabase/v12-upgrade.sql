-- HGN v12 upgrade: stable live map submissions and community board support

create table if not exists live_map_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text default 'Community',
  town text,
  details text,
  contact_name text,
  contact_email text,
  status text default 'pending',
  created_at timestamptz default now(),
  approved_at timestamptz,
  published_at timestamptz
);

alter table live_map_items enable row level security;
drop policy if exists "Anyone can submit live map items" on live_map_items;
drop policy if exists "Anyone can read approved live map items" on live_map_items;
create policy "Anyone can submit live map items" on live_map_items for insert with check (true);
create policy "Anyone can read approved live map items" on live_map_items for select using (status in ('approved','published'));

create table if not exists puzzle_archive (
  id uuid primary key default gen_random_uuid(),
  puzzle_type text not null,
  title text not null,
  publish_date date default current_date,
  puzzle_data jsonb default '{}'::jsonb,
  solution_data jsonb default '{}'::jsonb,
  status text default 'draft',
  created_at timestamptz default now()
);

alter table puzzle_archive enable row level security;
drop policy if exists "Published puzzles are readable" on puzzle_archive;
create policy "Published puzzles are readable" on puzzle_archive for select using (status = 'published');

-- Stop recursive profile policies if older versions created them
alter table if exists profiles disable row level security;

-- Keep your own email as admin if it exists in Supabase Auth / user_roles
insert into user_roles (email, role)
values ('brzostowski@gmail.com', 'admin')
on conflict (email) do update set role = 'admin';
