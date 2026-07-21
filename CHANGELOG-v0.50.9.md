# HGN v0.50.9

## Fixed

- Fixed front-page image uploads failing with `Invalid Compact JWS` when the Supabase server credential is a newer `sb_secret_...` key.
- Media storage and database writes now support both newer Supabase secret keys and legacy JWT service-role keys.
- New secret keys are sent as API keys and are never incorrectly parsed as bearer JWTs.
- Existing signed-in administrator/publisher verification remains in place before any upload is processed.

No Supabase migration is required.
