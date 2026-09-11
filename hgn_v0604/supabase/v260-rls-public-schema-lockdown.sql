-- HGN v0.48.6: close public-schema tables that were created without RLS.
-- Run this in Supabase SQL Editor BEFORE deploying v0.48.6.
-- Existing RLS-enabled tables and their policies are left unchanged.

begin;

-- Shared helper used by the generated admin policies.
create or replace function public.hgn_is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  );
$$;

revoke all on function public.hgn_is_editor() from public;
grant execute on function public.hgn_is_editor() to authenticated, service_role;

-- Enable RLS on every ordinary table in public that does not already have it.
do $$
declare
  r record;
  policy_name text;
begin
  for r in
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not c.relrowsecurity
  loop
    execute format('alter table public.%I enable row level security', r.table_name);
    policy_name := 'hgn_editor_manage_' || left(md5(r.table_name), 12);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.hgn_is_editor()) with check (public.hgn_is_editor())',
      policy_name,
      r.table_name
    );
  end loop;
end $$;

-- Public reference/content tables that are intentionally readable by visitors.
-- Policies are added only when the table exists and no equivalent policy name exists.
do $$
declare
  t text;
  public_read_tables text[] := array[
    'marketplace_categories','marketplace_towns','towns','hgn_towns',
    'publication_settings','site_notices','daily_highlights',
    'community_polls','ad_packages','sponsor_assets'
  ];
begin
  foreach t in array public_read_tables loop
    if to_regclass('public.' || t) is not null then
      if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = t and policyname = 'hgn_public_read'
      ) then
        execute format('create policy hgn_public_read on public.%I for select to anon, authenticated using (true)', t);
      end if;
    end if;
  end loop;
end $$;

commit;

-- Verification: this must return zero rows after the migration.
select schemaname, tablename
from pg_tables
where schemaname = 'public'
  and rowsecurity = false
order by tablename;
