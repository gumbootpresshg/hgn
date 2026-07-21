-- HGN v10 upgrade
-- Adds marketplace town/location support, newsletter table, and cleans fuel references from the app UI.

alter table classifieds add column if not exists location text;
alter table classifieds add column if not exists image_url text;
alter table classifieds add column if not exists phone text;

create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  town text,
  status text default 'active',
  created_at timestamptz default now()
);

alter table newsletter_signups enable row level security;

drop policy if exists "Public can sign up for newsletter" on newsletter_signups;
create policy "Public can sign up for newsletter"
on newsletter_signups for insert
with check (true);

drop policy if exists "Authenticated staff can read newsletter signups" on newsletter_signups;
create policy "Authenticated staff can read newsletter signups"
on newsletter_signups for select
to authenticated
using (true);

-- Keep Vince as admin during local development/testing.
insert into user_roles (email, role)
values ('brzostowski@gmail.com', 'admin')
on conflict (email) do update set role = 'admin';
