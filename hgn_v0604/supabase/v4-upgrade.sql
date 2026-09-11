-- HGN v4 big upgrade. Safe to run after schema.sql and v3-upgrade.sql.
create table if not exists reader_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  type text not null default 'News Tip',
  title text not null,
  location text,
  details text not null,
  media_url text,
  status text not null default 'new' check (status in ('new','reviewing','assigned','used','archived')),
  created_at timestamptz default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  source text default 'website',
  status text not null default 'active' check (status in ('active','unsubscribed')),
  created_at timestamptz default now()
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

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  caption text not null,
  link_url text,
  scheduled_for timestamptz,
  status text not null default 'draft',
  created_at timestamptz default now()
);

alter table reader_reports enable row level security;
alter table newsletter_subscribers enable row level security;
alter table assignments enable row level security;
alter table print_editions enable row level security;
alter table social_posts enable row level security;

drop policy if exists "Public can submit reader reports" on reader_reports;
create policy "Public can submit reader reports" on reader_reports for insert with check (true);

drop policy if exists "Public can join newsletter" on newsletter_subscribers;
create policy "Public can join newsletter" on newsletter_subscribers for insert with check (true);

drop policy if exists "Editors read reader reports" on reader_reports;
create policy "Editors read reader reports" on reader_reports for select to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors update reader reports" on reader_reports;
create policy "Editors update reader reports" on reader_reports for update to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors delete reader reports" on reader_reports;
create policy "Editors delete reader reports" on reader_reports for delete to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors read newsletter" on newsletter_subscribers;
create policy "Editors read newsletter" on newsletter_subscribers for select to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors update newsletter" on newsletter_subscribers;
create policy "Editors update newsletter" on newsletter_subscribers for update to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors delete newsletter" on newsletter_subscribers;
create policy "Editors delete newsletter" on newsletter_subscribers for delete to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors manage assignments" on assignments;
create policy "Editors manage assignments" on assignments for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor'))) with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors manage print editions" on print_editions;
create policy "Editors manage print editions" on print_editions for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor'))) with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors manage social posts" on social_posts;
create policy "Editors manage social posts" on social_posts for all to authenticated using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor'))) with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
