# HGN v181 — Letters HTML Cleanup SQL Fix

This replaces the v180 SQL cleanup with a simpler migration.

## Fixes

`syntax error at or near "create"`

## What changed

- Removed the SQL function body
- Uses plain UPDATE statements only
- Cleans `<p>...</p>` tags from imported letters
- Keeps the TypeScript display cleanup from v180

## SQL to run

`supabase/v181-letters-html-cleanup-sql-fix.sql`

You do not need to run the broken v180 SQL again.
