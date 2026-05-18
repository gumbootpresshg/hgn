-- HGN v177 - Article Media + Banner Cleanup
-- Adds article image fields and storage policies for optimized online photos.
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.articles add column if not exists image_url text;
alter table public.articles add column if not exists image_alt text;
alter table public.articles add column if not exists image_caption text;
alter table public.articles add column if not exists image_credit text;
alter table public.articles add column if not exists updated_at timestamptz default now();

update public.articles
set image_alt = coalesce(nullif(image_alt, ''), title, 'Article image'),
    updated_at = now()
where image_url is not null
  and image_url <> ''
  and (image_alt is null or image_alt = '');

-- Storage bucket for article/media uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hgn-media',
  'hgn-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Public can read media. Authenticated users can upload/update/delete media.
drop policy if exists "hgn_media_public_read" on storage.objects;
create policy "hgn_media_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'hgn-media');

drop policy if exists "hgn_media_authenticated_insert" on storage.objects;
create policy "hgn_media_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'hgn-media');

drop policy if exists "hgn_media_authenticated_update" on storage.objects;
create policy "hgn_media_authenticated_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'hgn-media')
with check (bucket_id = 'hgn-media');

drop policy if exists "hgn_media_authenticated_delete" on storage.objects;
create policy "hgn_media_authenticated_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'hgn-media');
