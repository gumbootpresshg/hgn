-- HGN v6 cleanup: invite-only contributors, cleaner nav, safer profile roles.
-- Run after schema.sql and earlier upgrade files.

create table if not exists contributor_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'contributor' check (role in ('contributor','columnist','advertiser','editor')),
  token text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  invited_by uuid references profiles(id),
  accepted_by uuid references profiles(id),
  accepted_at timestamptz,
  created_at timestamptz default now()
);

alter table contributor_invites enable row level security;

drop policy if exists "Editors manage contributor invites" on contributor_invites;
create policy "Editors manage contributor invites" on contributor_invites for all to authenticated
using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

-- Allow invite links to be verified by token without a login.
drop policy if exists "Public can read pending contributor invites by token" on contributor_invites;
create policy "Public can read pending contributor invites by token" on contributor_invites for select
using (status='pending');

-- Allow the invited user to mark their invite accepted after signup.
drop policy if exists "Invited users can accept their own invite" on contributor_invites;
create policy "Invited users can accept their own invite" on contributor_invites for update to authenticated
using (status='pending' and lower(email) = lower((select email from auth.users where id = auth.uid())))
with check (lower(email) = lower((select email from auth.users where id = auth.uid())));

-- Make profiles manageable by admins/editors, while preventing role escalation by regular users.
drop policy if exists "Editors manage profiles" on profiles;
create policy "Editors manage profiles" on profiles for all to authenticated
using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if old.role is distinct from new.role then
    if not exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','editor')) then
      raise exception 'Only admins/editors can change profile roles';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation_trigger on profiles;
create trigger prevent_profile_role_escalation_trigger
before update on profiles
for each row execute procedure public.prevent_profile_role_escalation();

-- Keep marketplace/photo terminology generic; no schema change required.
