# HGN v163 — Classifieds Table Review Fix

The marketplace form was saving to `public.classifieds`, while the admin review page was looking mostly at newer review tables.

## Fixed

- Added/repairs `public.classifieds`
- Adds RLS policies for:
  - public insert
  - public read approved only
  - authenticated admin/editor review
- `/admin/submissions` now reads `classifieds`
- Existing `classifieds` rows are mirrored into `submission_inbox`
- `/marketplace/new` has a fallback API submission path

## Run this SQL

`supabase/v163-classifieds-table-review-fix.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Submit a marketplace item.
4. Open `/admin/submissions`.
5. Click Refresh.
6. It should appear under Marketplace / classifieds.
