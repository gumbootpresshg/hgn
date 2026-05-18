-- HGN v248 - Poll Results + Members Admin Cleanup
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.hgn_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  display_name text,
  account_type text default 'free_individual',
  phone text,
  community text,
  newsletter_opt_in boolean default false,
  member_badge boolean default false,
  verified_plus boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.hgn_profiles enable row level security;

drop policy if exists "hgn_profiles_authenticated_read" on public.hgn_profiles;
create policy "hgn_profiles_authenticated_read"
on public.hgn_profiles for select
to authenticated
using (true);

drop policy if exists "hgn_profiles_authenticated_update" on public.hgn_profiles;
create policy "hgn_profiles_authenticated_update"
on public.hgn_profiles for update
to authenticated
using (true)
with check (true);

drop policy if exists "hgn_profiles_authenticated_delete" on public.hgn_profiles;
create policy "hgn_profiles_authenticated_delete"
on public.hgn_profiles for delete
to authenticated
using (true);

-- Poll results need public read access to count votes.
alter table public.poll_votes enable row level security;

drop policy if exists "poll_votes_public_read_results" on public.poll_votes;
create policy "poll_votes_public_read_results"
on public.poll_votes for select
to anon, authenticated
using (true);

drop policy if exists "poll_votes_public_insert" on public.poll_votes;
create policy "poll_votes_public_insert"
on public.poll_votes for insert
to anon, authenticated
with check (true);

notify pgrst, 'reload schema';
