# HGN v142 - Reader Ready Polish

This upgrade shifts the soft-beta push toward what real readers will notice first.

## Added

- `/admin/reader-ready`
- `/reader-ready-status`
- `src/lib/reader-ready.ts`
- `supabase/v142-upgrade.sql`

## Focus

- homepage first impression
- article trust/readability
- mobile presentation
- unfinished public route cleanup
- tagline consistency: **Free, Independent, Local.**

## Notes

The migration is defensive and can be rerun if a previous attempt partially created the tables.
