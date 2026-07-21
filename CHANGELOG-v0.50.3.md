# HGN v0.50.3

## Media upload permission repair

- Replaced the front-page media uploader's single-row profile check with the same broad newsroom authorization model needed by legacy and current HGN accounts.
- Publisher access can now be resolved from `hgn_profiles` or `member_permissions`.
- Matches permission records by Supabase user ID and, as a safe legacy fallback, the authenticated email address.
- Handles duplicate or older profile records without failing on `maybeSingle()`.
- Recognizes administrator, publisher, editor and newsroom role fields, including legacy `admin_role` values and Supabase auth metadata.
- Retains authenticated-user verification, server-only service credentials, file validation and storage restrictions.
- No Supabase migration is required.
