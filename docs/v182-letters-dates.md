# HGN v182 — Letters Dates

Adds visible dates to Letters to the Editor.

## Fixed

- Public `/letters` now shows date beside author
- Uses `published_at` first
- Falls back to `created_at`
- SQL backfills missing dates
- Admin content/letter archive views show dates too

## SQL to run

`supabase/v182-letters-dates.sql`
