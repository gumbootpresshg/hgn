# HGN v0.67.2 — Guide Manager Foundation

- Added Admin → Guide Manager for creating, editing, drafting, publishing, featuring and archiving public Guide places.
- Added verification/source fields, coordinates, safety notes, amenities and optional public image URLs.
- Added controlled Guide Keeper apply workflow: a reviewer chooses the target place, applies only safe proposed fields, and records the reviewer, time and before/after values.
- Added additive migration `supabase/v300-guide-manager-foundation.sql` for image support and the Guide change log.
- Added a daily Vercel Guide Keeper cron and made it honour each source's configured check frequency.
- Corrected the Food & Fuel Guide card so it opens the relevant map category rather than a mismatched Directory filter.
- Redirected the old Admin Visitor Guide entry point to Guide Manager and old public Visitor Guide URLs to the single Explore Guide; no legacy listing data was deleted.

## Content note

This release creates the safe publishing foundation. It does not invent business, food, fuel or accommodation information. Populate and verify those listings in Guide Manager before featuring them publicly.
