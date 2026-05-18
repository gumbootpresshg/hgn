-- HGN v7 fix: no public admin link, email-based roles, and Vince admin promotion.
-- Run this after v6-upgrade.sql. Safe to run more than once.

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'contributor' check (role in ('admin','editor','contributor','columnist','advertiser')),
  created_at timestamptz default now()
);

alter table user_roles enable row level security;

drop policy if exists "Anyone can read user roles" on user_roles;
create policy "Anyone can read user roles"
on user_roles for select
using (true);

drop policy if exists "Admins manage user roles" on user_roles;
create policy "Admins manage user roles"
on user_roles for all to authenticated
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','editor')))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','editor')));

-- Fix the current owner account. This is the email you are signed into locally.
insert into user_roles (email, role)
values ('brzostowski@gmail.com', 'admin')
on conflict (email) do update set role = 'admin';

-- The admin dashboard data policies still use profiles, so sync the Supabase Auth user to profiles too.
-- Drop the old trigger first so the SQL editor can promote the account cleanly.
drop trigger if exists prevent_profile_role_escalation_trigger on profiles;

insert into profiles (id, full_name, role)
select id, coalesce(raw_user_meta_data->>'full_name', email), 'admin'
from auth.users
where lower(email) = lower('brzostowski@gmail.com')
on conflict (id) do update set role = 'admin';

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if old.role is distinct from new.role then
    -- Allow trusted SQL/editor/service contexts where auth.uid() is not present.
    if auth.uid() is null then
      return new;
    end if;

    if not exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','editor')) then
      raise exception 'Only admins/editors can change profile roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger prevent_profile_role_escalation_trigger
before update on profiles
for each row execute procedure public.prevent_profile_role_escalation();

-- Make profile reads stable for the browser.
drop policy if exists "Profiles readable signed in" on profiles;
create policy "Profiles readable signed in" on profiles for select to authenticated using (true);

-- Check result:
-- select u.email, p.role as profile_role, r.role as email_role
-- from auth.users u
-- left join profiles p on p.id = u.id
-- left join user_roles r on lower(r.email)=lower(u.email)
-- where lower(u.email)=lower('brzostowski@gmail.com');
