-- HGN v16 upgrade: audience, corrections, story tips, import support

create table if not exists audience_members (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  plan text default 'newsletter',
  status text default 'active',
  source text,
  notes text,
  created_at timestamptz default now()
);

create unique index if not exists audience_members_email_plan_idx on audience_members (lower(email), plan);

create table if not exists story_tips (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  town text,
  title text not null,
  details text not null,
  status text default 'new',
  assigned_to text,
  created_at timestamptz default now()
);

create table if not exists correction_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  story_url text,
  details text,
  status text default 'new',
  editor_notes text,
  created_at timestamptz default now()
);

create table if not exists import_batches (
  id uuid primary key default gen_random_uuid(),
  source text default 'wordpress',
  filename text,
  imported_count int default 0,
  skipped_count int default 0,
  notes text,
  status text default 'planned',
  created_at timestamptz default now()
);

alter table articles add column if not exists wordpress_id text;
alter table articles add column if not exists original_url text;
alter table articles add column if not exists imported_at timestamptz;
create unique index if not exists articles_wordpress_id_idx on articles (wordpress_id) where wordpress_id is not null;

alter table audience_members enable row level security;
alter table story_tips enable row level security;
alter table correction_requests enable row level security;
alter table import_batches enable row level security;

drop policy if exists "Public can create audience" on audience_members;
create policy "Public can create audience" on audience_members for insert with check (true);
drop policy if exists "Authenticated can read audience" on audience_members;
create policy "Authenticated can read audience" on audience_members for select to authenticated using (true);
drop policy if exists "Authenticated can update audience" on audience_members;
create policy "Authenticated can update audience" on audience_members for update to authenticated using (true) with check (true);

drop policy if exists "Public can create story tips" on story_tips;
create policy "Public can create story tips" on story_tips for insert with check (true);
drop policy if exists "Authenticated can manage story tips" on story_tips;
create policy "Authenticated can manage story tips" on story_tips for all to authenticated using (true) with check (true);

drop policy if exists "Public can create corrections" on correction_requests;
create policy "Public can create corrections" on correction_requests for insert with check (true);
drop policy if exists "Authenticated can manage corrections" on correction_requests;
create policy "Authenticated can manage corrections" on correction_requests for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated can manage imports" on import_batches;
create policy "Authenticated can manage imports" on import_batches for all to authenticated using (true) with check (true);
