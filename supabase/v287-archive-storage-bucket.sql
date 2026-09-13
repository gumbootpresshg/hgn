-- HGN v0.65.2 - dedicated archive storage bucket
-- Safe to rerun. Keeps newspaper PDFs separate from normal image/media uploads.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hgn-archives',
  'hgn-archives',
  true,
  125829120,
  array['application/pdf','image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 125829120,
    allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "hgn_archives_public_read" on storage.objects;
create policy "hgn_archives_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'hgn-archives');

drop policy if exists "hgn_archives_authenticated_insert" on storage.objects;
create policy "hgn_archives_authenticated_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'hgn-archives');

drop policy if exists "hgn_archives_authenticated_update" on storage.objects;
create policy "hgn_archives_authenticated_update"
on storage.objects for update
to authenticated
using (bucket_id = 'hgn-archives')
with check (bucket_id = 'hgn-archives');

drop policy if exists "hgn_archives_authenticated_delete" on storage.objects;
create policy "hgn_archives_authenticated_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'hgn-archives');
