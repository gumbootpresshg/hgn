-- HGN v5 cleanup + phone marketplace + real role lanes.
-- Safe to run after schema.sql, v3-upgrade.sql, and v4-upgrade.sql.

-- Make sure marketplace supports phone photos.
alter table classifieds add column if not exists phone text;
alter table classifieds add column if not exists image_url text;

-- Make sure profiles support separated lanes.
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('admin','editor','contributor','columnist','advertiser'));

-- Public media bucket for uploaded marketplace / reader photos.
insert into storage.buckets (id, name, public)
values ('hgn-media', 'hgn-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can upload HGN media" on storage.objects;
create policy "Public can upload HGN media"
on storage.objects for insert
with check (bucket_id = 'hgn-media');

drop policy if exists "Public can read HGN media" on storage.objects;
create policy "Public can read HGN media"
on storage.objects for select
using (bucket_id = 'hgn-media');

drop policy if exists "Editors can manage HGN media" on storage.objects;
create policy "Editors can manage HGN media"
on storage.objects for all
using (
  bucket_id = 'hgn-media'
  and exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
)
with check (
  bucket_id = 'hgn-media'
  and exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
);

-- Admin/editor access policies for key tables.
drop policy if exists "Editors manage articles" on articles;
create policy "Editors manage articles" on articles for all
using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Contributors manage own articles" on articles;
create policy "Contributors manage own articles" on articles for all
using (author_id = auth.uid() or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
with check (author_id = auth.uid() or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors read letters" on letters_to_editor;
create policy "Editors read letters" on letters_to_editor for select
using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors update letters" on letters_to_editor;
create policy "Editors update letters" on letters_to_editor for update
using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors read classifieds" on classifieds;
create policy "Editors read classifieds" on classifieds for select
using (status='approved' or exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors update classifieds" on classifieds;
create policy "Editors update classifieds" on classifieds for update
using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors read ad requests" on ad_requests;
create policy "Editors read ad requests" on ad_requests for select
using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

drop policy if exists "Editors update ad requests" on ad_requests;
create policy "Editors update ad requests" on ad_requests for update
using (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
with check (exists (select 1 from profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

-- Upgrade yourself to admin after creating/logging into your account:
-- 1. Supabase > Authentication > Users > copy your user UUID
-- 2. Replace YOUR-USER-UUID-HERE below and run it:
-- update profiles set role='admin' where id='YOUR-USER-UUID-HERE';
