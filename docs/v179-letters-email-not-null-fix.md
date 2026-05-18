# HGN v179 — Letters Email NOT NULL Fix

This fixes:

`null value in column "email" of relation "letters_to_editor" violates not-null constraint`

## Why

Older letters imported from article rows do not have a reader email address, but your existing `letters_to_editor.email` column is required.

## Fix

Archive-imported letters now use:

`archive-import@haidagwaiinews.local`

This is an internal placeholder, not shown publicly.

## SQL to run

`supabase/v179-letters-email-not-null-fix.sql`

Then check:
- `/admin/letters/archive`
- `/letters`
