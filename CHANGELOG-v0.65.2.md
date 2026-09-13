# HGN v0.65.2

## Archive PDF storage fix

- Added a dedicated `hgn-archives` Supabase Storage bucket for newspaper editions.
- Allows `application/pdf` plus common cover-image MIME types.
- Raises archive bucket file limit to 120 MB.
- Archive signed uploads now target `hgn-archives` instead of the image-only `hgn-media` bucket.
- Leaves the existing general media bucket restrictions unchanged.
