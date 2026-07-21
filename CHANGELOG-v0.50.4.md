# HGN v0.50.4 - Authenticated Publisher Upload Fix

## Fixed

- Media uploads now validate newsroom access through the live authenticated Supabase client first, matching the permission path already used by the Admin gate.
- Service-role permission lookup remains as a fallback for legacy administrator and publisher records.
- Storage writes still use the protected server-side service client after authorization succeeds.
- No Supabase migration is required.
