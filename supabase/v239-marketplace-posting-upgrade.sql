-- HGN v239 - Marketplace Posting Upgrade
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.classifieds add column if not exists price_amount numeric;
alter table public.classifieds add column if not exists image_url text;
alter table public.classifieds add column if not exists photo_urls text[] default '{}';
alter table public.classifieds add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.classifieds add column if not exists owner_email text;
alter table public.classifieds add column if not exists deleted_at timestamptz;
alter table public.classifieds add column if not exists updated_at timestamptz default now();

create table if not exists public.member_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  can_post_classifieds boolean default true,
  can_post_jobs boolean default false,
  can_post_real_estate boolean default false,
  newsletter_opt_in boolean default false,
  verified_plus boolean default false,
  jobs_paid_until date,
  real_estate_paid_until date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_member_permissions_user on public.member_permissions (user_id);

-- Storage bucket for marketplace images.
insert into storage.buckets (id, name, public)
values ('marketplace-photos', 'marketplace-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "marketplace_photos_public_read" on storage.objects;
create policy "marketplace_photos_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'marketplace-photos');

drop policy if exists "marketplace_photos_authenticated_upload" on storage.objects;
create policy "marketplace_photos_authenticated_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'marketplace-photos');

drop policy if exists "marketplace_photos_owner_update" on storage.objects;
create policy "marketplace_photos_owner_update"
on storage.objects for update
to authenticated
using (bucket_id = 'marketplace-photos' and owner = auth.uid())
with check (bucket_id = 'marketplace-photos' and owner = auth.uid());

notify pgrst, 'reload schema';
