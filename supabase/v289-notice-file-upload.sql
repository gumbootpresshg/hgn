-- HGN v0.65.6 - direct notice file uploads
-- Safe to rerun. Dedicated public bucket for staff-uploaded notice PDFs and images.
-- Upload authorization is issued by the publisher-only signed-upload API route.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hgn-notices',
  'hgn-notices',
  true,
  41943040,
  array['application/pdf','image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 41943040,
    allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "hgn_notices_public_read" on storage.objects;
create policy "hgn_notices_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'hgn-notices');

-- Do not grant blanket authenticated writes. Staff uploads use one-time signed upload URLs
-- created only after requirePublisher() succeeds.
drop policy if exists "hgn_notices_authenticated_insert" on storage.objects;
drop policy if exists "hgn_notices_authenticated_update" on storage.objects;
drop policy if exists "hgn_notices_authenticated_delete" on storage.objects;
