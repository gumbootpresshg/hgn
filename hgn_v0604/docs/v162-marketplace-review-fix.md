# HGN v162 — Marketplace Review Fix

This fixes the issue where a submitted marketplace item does not appear in `/admin/submissions`.

## What changed

- `classified_submissions` table is repaired/created
- RLS insert/review policies are added
- `/api/submit/classified` now mirrors posts into:
  - `classified_submissions`
  - `submission_inbox`
- `/admin/submissions` now also tries old marketplace tables:
  - `marketplace_posts`
  - `marketplace`

## SQL to run

Run:

`supabase/v162-marketplace-review-fix.sql`

## After running SQL

1. Restart dev server.
2. Submit a new marketplace item.
3. Open `/admin/submissions`.
4. Click Refresh.

If an item was submitted before v162 and went into an old table, the review page may show it after this update if that table exists and has readable policies.
