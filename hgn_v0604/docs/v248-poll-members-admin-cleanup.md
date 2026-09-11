# HGN v248 — Poll, Members, Admin Cleanup

## Fixed

- Poll results now increment immediately after voting and reload counts.
- SQL adds public read policy for poll vote results.
- Homepage upcoming event time display removed only from the homepage file.
- `/events` page still keeps event times.
- Admin Members page now lists member profiles.
- Admin can:
  - verify/unverify
  - add/remove member badge
  - mark paid individual
  - mark business
  - delete member profile
- Cleaned stray literal `\n` text in admin pages.

## SQL to run

`supabase/v248-poll-members-admin-cleanup.sql`
