# HGN v165 — Submission Queue Split

This fixes the admin submissions page mixing marketplace posts into Reader submissions.

## Fixed

- Reader submissions exclude marketplace/classified mirrored rows
- Marketplace/classifieds section includes marketplace/classified rows
- Jobs section includes job rows
- Normalizes missing `submission_type` values
- Keeps approve/pending/reject/delete controls

## SQL to run

`supabase/v165-submission-queue-split.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Open `/admin/submissions`.
4. Reader submissions should only show tips/letters/notices/events/obituaries.
5. Marketplace posts should show under Marketplace / classifieds.
