# HGN v174 — Letters Archive Visibility

This fixes older/past Letters to the Editor not showing after the new editor workflow.

## Why it happened

The new public `/letters` page was only reading rows with:

`status = approved`

Older letters may have used:

- `published`
- `active`
- `public`
- `live`
- blank/null status
- missing `published_at`

## Fixed

- Public `/letters` reads common published statuses
- SQL normalizes old published-style statuses to `approved`
- SQL backfills `letter`, `body`, `message`, `edited_body`
- SQL fills missing `published_at`
- SQL keeps public reads limited to published/approved letters

## SQL to run

`supabase/v174-letters-archive-visibility.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Open `/letters`.
4. Older published letters should appear again.
