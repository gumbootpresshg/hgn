-- HGN v33 demo/editor polish
-- Staff collaboration, contributor commitments, and reminder prep.

create table if not exists staff_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  author_email text,
  topic text default 'General',
  message text not null
);

create table if not exists contributor_commitments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  contributor_email text,
  contributor_name text,
  issue_date date,
  submission_type text,
  title text,
  notes text,
  status text default 'planned'
);

alter table staff_messages enable row level security;
alter table contributor_commitments enable row level security;

drop policy if exists "Authenticated can read staff messages" on staff_messages;
drop policy if exists "Authenticated can insert staff messages" on staff_messages;
drop policy if exists "Authenticated can read contributor commitments" on contributor_commitments;
drop policy if exists "Authenticated can insert contributor commitments" on contributor_commitments;

create policy "Authenticated can read staff messages"
on staff_messages for select
to authenticated
using (true);

create policy "Authenticated can insert staff messages"
on staff_messages for insert
to authenticated
with check (true);

create policy "Authenticated can read contributor commitments"
on contributor_commitments for select
to authenticated
using (true);

create policy "Authenticated can insert contributor commitments"
on contributor_commitments for insert
to authenticated
with check (true);

-- Make sure the sections the editor mentioned exist in the current schema.
create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  notice_type text default 'Obituary',
  body text,
  status text default 'pending'
);

create table if not exists site_alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  label text,
  kind text default 'notice',
  message text,
  status text default 'active'
);

alter table articles add column if not exists image_url text;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists status text default 'draft';
alter table articles add column if not exists category text;
alter table articles add column if not exists section text;
alter table articles add column if not exists author_name text;
alter table articles add column if not exists excerpt text;
alter table articles add column if not exists published_at timestamptz;

update articles set status = 'published' where status is null;
update articles set author_name = 'Haida Gwaii News' where author_name is null or trim(author_name) = '';
update articles set category = section where category is null and section is not null;
update articles set category = 'News' where category is null or trim(category) = '';
