# HGN v0.50.8

## Authenticated profile upload permission fix

- Front-page media uploads now verify newsroom access through the same live, authenticated `hgn_profiles` row used by the Admin gate.
- The permission query uses the signed-in user token and Supabase RLS directly.
- The service role is used only after administrator or publisher access has been confirmed.
- Replaces the separate server-side profile matching path that could reject a valid administrator.
- No database migration is required.
