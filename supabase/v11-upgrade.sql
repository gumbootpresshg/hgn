-- HGN v11 upgrade
-- Make the concept pages more functional: Ask Annie, games, staff planning, event approval, map/location cleanup.

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'contributor',
  created_at timestamptz default now()
);

alter table user_roles enable row level security;
drop policy if exists "Authenticated users can read roles" on user_roles;
drop policy if exists "Anyone can read roles" on user_roles;
create policy "Authenticated users can read roles" on user_roles for select to authenticated using (true);

-- Ensure community event table has the fields used by the new event submit/review flow.
create table if not exists community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date text,
  time text,
  town text,
  location text,
  contact_name text,
  email text,
  phone text,
  description text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table community_events add column if not exists time text;
alter table community_events add column if not exists town text;
alter table community_events add column if not exists email text;
alter table community_events add column if not exists phone text;
alter table community_events add column if not exists contact_email text;

create table if not exists ask_annie_questions (
  id uuid primary key default gen_random_uuid(),
  name text,
  display_name text,
  email text,
  town text,
  question text not null,
  answer text,
  status text not null default 'new',
  created_at timestamptz default now(),
  published_at timestamptz
);

create table if not exists game_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  game_type text not null default 'Crossword',
  description text,
  puzzle_url text,
  solution_url text,
  status text not null default 'draft',
  created_at timestamptz default now(),
  published_at timestamptz
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  assigned_to text,
  photographer text,
  due_date date,
  priority text default 'normal',
  status text not null default 'idea',
  notes text,
  created_at timestamptz default now()
);

create table if not exists print_editions (
  id uuid primary key default gen_random_uuid(),
  issue_date date not null,
  title text,
  front_page_story text,
  pdf_url text,
  status text not null default 'planning',
  notes text,
  created_at timestamptz default now()
);

alter table ask_annie_questions enable row level security;
alter table game_posts enable row level security;
alter table community_events enable row level security;
alter table assignments enable row level security;
alter table print_editions enable row level security;

-- Public submissions / public reads.
drop policy if exists "Public can submit ask annie" on ask_annie_questions;
create policy "Public can submit ask annie" on ask_annie_questions for insert with check (true);
drop policy if exists "Public can read published ask annie" on ask_annie_questions;
create policy "Public can read published ask annie" on ask_annie_questions for select using (status = 'published');

drop policy if exists "Public can read published games" on game_posts;
create policy "Public can read published games" on game_posts for select using (status = 'published');

drop policy if exists "Public can submit events" on community_events;
create policy "Public can submit events" on community_events for insert with check (true);
drop policy if exists "Public can read approved events" on community_events;
create policy "Public can read approved events" on community_events for select using (status in ('approved','published'));

-- Development-friendly authenticated staff access.
drop policy if exists "Authenticated staff manage ask annie" on ask_annie_questions;
create policy "Authenticated staff manage ask annie" on ask_annie_questions for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated staff manage games" on game_posts;
create policy "Authenticated staff manage games" on game_posts for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated staff manage events" on community_events;
create policy "Authenticated staff manage events" on community_events for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated staff manage assignments" on assignments;
create policy "Authenticated staff manage assignments" on assignments for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated staff manage print editions" on print_editions;
create policy "Authenticated staff manage print editions" on print_editions for all to authenticated using (true) with check (true);

-- Remove old recursive profile-based policies if they exist.
drop policy if exists "Editors manage assignments" on assignments;
drop policy if exists "Editors manage print editions" on print_editions;

insert into user_roles (email, role)
values ('brzostowski@gmail.com', 'admin')
on conflict (email) do update set role = 'admin';
