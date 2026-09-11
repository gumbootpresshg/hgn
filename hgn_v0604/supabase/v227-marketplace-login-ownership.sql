create extension if not exists pgcrypto;

alter table public.classifieds add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.classifieds add column if not exists owner_email text;
alter table public.classifieds add column if not exists status text default 'pending';
alter table public.classifieds add column if not exists deleted_at timestamptz;
alter table public.classifieds add column if not exists sold_at timestamptz;
alter table public.classifieds add column if not exists updated_at timestamptz default now();

alter table public.classifieds enable row level security;

drop policy if exists "classifieds_public_read_approved" on public.classifieds;
create policy "classifieds_public_read_approved"
on public.classifieds for select
to anon, authenticated
using (deleted_at is null and status in ('approved','published','public','live','active'));

drop policy if exists "classifieds_owner_read_own" on public.classifieds;
create policy "classifieds_owner_read_own"
on public.classifieds for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "classifieds_owner_insert_own" on public.classifieds;
create policy "classifieds_owner_insert_own"
on public.classifieds for insert
to authenticated
with check (auth.uid() = user_id and status in ('draft','pending'));

drop policy if exists "classifieds_owner_update_own" on public.classifieds;
create policy "classifieds_owner_update_own"
on public.classifieds for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and status in ('draft','pending','sold','expired','removed'));

drop policy if exists "classifieds_owner_delete_own" on public.classifieds;
create policy "classifieds_owner_delete_own"
on public.classifieds for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists idx_classifieds_user_status
on public.classifieds (user_id, status, created_at desc);

notify pgrst, 'reload schema';
