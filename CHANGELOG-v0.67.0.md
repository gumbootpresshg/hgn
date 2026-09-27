# HGN v0.67.0 — Island Lens Bulk Photo Upload

- Island Lens now accepts up to 60 JPG, PNG or WebP photos in one selection.
- Each photo is resized in the browser to a maximum 2000px edge and converted to WebP at gallery quality before its signed direct upload. Original large camera files are not sent to the server.
- Shows per-photo preparation/upload progress and keeps successfully uploaded photos if a later file has a problem.
- Removes Print Issue Label and Digital Paper Link from the Island Lens editor and public photo-feature page.
- Corrects the public URL display to `haidagwaiinews.com/island-lens/...`.

## Database

No Supabase migration is required for this release.
