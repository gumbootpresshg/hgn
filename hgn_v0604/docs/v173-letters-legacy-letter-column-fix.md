# HGN v173 — Letters Legacy `letter` Column Fix

This fixes:

`null value in column "letter" of relation "letters_to_editor" violates not-null constraint`

## Why it happened

Your existing Supabase table has an older required column named:

`letter`

The newer app was publishing into:

- `message`
- `body`
- `edited_body`

…but not the old `letter` column.

## Fixed

- Adds/repairs `letter` column
- Backfills old rows
- Sets safe default
- Publish code now writes `letter`
- Public `/letters` can display `letter` as fallback

## SQL to run

`supabase/v173-letters-legacy-letter-column-fix.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Open `/admin/letters`.
4. Click `Approve & publish`.
5. Open `/letters`.
