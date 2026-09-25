# Deploy HGN v0.66.0

1. Run `supabase/v292-newsletter-subscriber-reliability.sql` in Public HGN Supabase, after v291.
2. Overlay this package on `C:\HGN\HGNSite`, preserving `.git` and `.env.local`.
3. Run `npm.cmd install`, `npm.cmd run typecheck`, and `npm.cmd run build`.
4. Confirm a new signup appears at `/admin/subscribers` and that its welcome-email status is visible.

No new environment variables are required. `RESEND_API_KEY` and the existing newsletter sender settings must be configured for welcome emails to send.
