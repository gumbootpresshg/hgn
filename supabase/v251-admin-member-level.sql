-- HGN v251 - Admin Member Level
-- Safe to rerun.

alter table public.hgn_profiles add column if not exists is_admin boolean default false;
alter table public.hgn_profiles add column if not exists admin_role text;
alter table public.hgn_profiles add column if not exists can_access_publisher_tools boolean default false;

-- Allow the new account_type value if the table does not have a restrictive check.
-- If your database has an older account_type CHECK constraint, drop/recreate it safely.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'hgn_profiles_account_type_check'
  ) then
    alter table public.hgn_profiles drop constraint hgn_profiles_account_type_check;
  end if;
end $$;

alter table public.hgn_profiles
add constraint hgn_profiles_account_type_check
check (
  account_type in (
    'free_individual',
    'paid_individual',
    'business_organization',
    'admin'
  )
);

-- Back-compatible permissions table columns if used elsewhere.
alter table public.member_permissions add column if not exists is_admin boolean default false;
alter table public.member_permissions add column if not exists can_access_publisher_tools boolean default false;
alter table public.member_permissions add column if not exists admin_role text;

notify pgrst, 'reload schema';
