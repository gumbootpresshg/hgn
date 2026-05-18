# HGN v178 — Letters Archive Import

This addresses the issue where `/letters` only shows the new test letter.

## Why

Older letters are likely not in `letters_to_editor`. They may be stored as regular `articles` rows with a category/title like:

- Letter
- Letters to the Editor
- Opinion
- Letter:

## Added

- `/admin/letters/archive`
- Public `/letters` now also falls back to matching article rows
- SQL imports likely letter/opinion article rows into `letters_to_editor`
- Import button for manual article-to-letter recovery

## SQL to run

`supabase/v178-letters-archive-import.sql`

## After running SQL

1. Open `/letters`
2. If older letters still do not show, open `/admin/letters/archive`
3. Look under “Likely old letters stored as articles”
4. Click `Import as published letter`
