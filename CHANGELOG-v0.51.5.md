# HGN v0.51.5

## Publisher access reliability

- Prevents the admin access gate from performing asynchronous Supabase work directly inside `onAuthStateChange`.
- Uses the existing browser session for quicker page-to-page admin navigation.
- Adds a 12-second timeout so the screen cannot remain on “Checking newsroom access…” forever.
- Adds a Retry access button for temporary network or session interruptions.
- Prevents older overlapping checks from replacing a newer result.
- Recognizes editor accounts in the shared admin gate.
- Pins `@supabase/supabase-js` to the tested lockfile version instead of installing an unpredictable future `latest` release.

No database migration is required.
