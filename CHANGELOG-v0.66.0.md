# HGN v0.66.0 — Newsletter Subscriber Reliability

## Fixed

- Public newsletter signups now use `public.subscribers` as the canonical delivery list and are visible in the dedicated Newsletter Subscribers admin screen.
- The obsolete compact newsletter signup component now uses the same canonical signup API instead of writing to `newsletter_subscribers`.
- New signups trigger a Resend welcome email and a preference-management link when Resend and sender settings are configured.
- Every welcome send attempt is recorded, including accepted, failed and skipped states. Staff can resend a welcome email from the subscriber list.
- The public form now reports a truthful outcome: saved + welcome sent, saved + welcome unavailable, or a clear signup failure.
- Added protected search, filters and CSV export for the canonical newsletter list.

## Database

Run `supabase/v292-newsletter-subscriber-reliability.sql` in the **Public HGN Supabase project**, after v291.

The migration does not assume that the legacy `newsletter_subscribers` table has a `town` column.

Legacy `audience_members` and `newsletter_subscribers` tables are retained for historical safety but are no longer used by the newsletter publisher workflow.

## Validation

- `npm run typecheck` passed.
- The hosted Next/Turbopack build began but did not return a final result before the sandbox runner ended the process. Run the supplied local production build before committing.
