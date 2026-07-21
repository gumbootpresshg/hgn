# HGN v0.50.5

- Fixed front-page media uploads failing with `Invalid Compact JWS`.
- Refreshes the browser session before every protected upload.
- Validates the access token before sending it.
- Server now reads the bearer token once through the authenticated Supabase client instead of parsing the same JWT twice.
- Publisher and administrator permission checks remain server-side.
- No Supabase migration required.
