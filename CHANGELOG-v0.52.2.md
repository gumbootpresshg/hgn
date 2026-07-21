# HGN v0.52.2

## Newsletter reliability and account preferences

- Repairs empty newsletter previews with a fallback to the newest published stories.
- Adds build diagnostics showing candidates, inclusions and exclusions.
- Blocks empty test sends and empty live sends.
- Shows the real Resend acceptance or failure response for test messages.
- Records recent newsletter test attempts and Resend message IDs.
- Adds manual story ordering and rebuild controls.
- Replaces the `/account/newsletters` placeholder with working logged-in preferences.
- Adds subscription, resubscription and unsubscribe controls for account holders.

## Database

Run `supabase/v273-newsletter-reliability-account.sql` after v272.
