# HGN v147 — Submission Inbox Guard

This update continues the security/submission alert hardening.

## Focus

- Confirm Letters to the Editor submissions stay private
- Confirm the email alert path works before online beta
- Keep phone/SMS alerts optional until email is reliable
- Track spam/rate-limit readiness

## Recommended test

1. Run `hgn_v147/supabase/v147-upgrade.sql`
2. Open `/admin/submission-inbox-guard`
3. Submit one test Letter to the Editor
4. Confirm the email alert arrives
5. Confirm public visitors cannot browse submitted letters
