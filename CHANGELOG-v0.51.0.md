# HGN v0.51.0

- Adds Admin -> AI Desk, a human-review queue for guide updates, news leads, event discoveries, broken links and future agents.
- Adds `supabase/v266-ai-desk.sql`.
- Replaces the failing server photo uploader with browser-side optimization and the same authenticated Supabase Storage path already used by article uploads.
- Removes the `sb_secret_` / compact-JWS conflict from front-page photo uploads.
