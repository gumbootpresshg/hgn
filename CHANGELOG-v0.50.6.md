# HGN v0.50.6

## Front-page upload button reliability

- Replaced the React form action upload with an explicit client submit handler.
- Added a guaranteed `type="submit"` upload button.
- Added visible session-checking, uploading, success, and error states.
- Added a clear warning when no image has been selected.
- Preserved authenticated upload permission checks and the one-time 401 session refresh retry.
- Resets the upload form only after a successful upload.

No Supabase migration is required.
