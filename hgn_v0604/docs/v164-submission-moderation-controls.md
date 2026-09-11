# HGN v164 — Submission Moderation Controls

This adds moderation controls to `/admin/submissions`.

## Added

- Approve
- Pending
- Reject
- Delete

## Applies to

- Marketplace/classifieds
- Classified submission queue
- Submission inbox
- Job submissions

## SQL to run

`supabase/v164-submission-moderation-controls.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Open `/admin/submissions`.
4. Approve a marketplace post.
5. Open `/marketplace`.
6. Approved posts should be visible publicly.
