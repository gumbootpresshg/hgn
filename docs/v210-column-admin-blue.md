# HGN v210 — Column Admin + HGN Blue Accent

## Fixed

- Replaced the custom RGB cyan with existing `hgnBlue`, matching the blue used on “What’s Happening” and “Island Utility.”
- Columns menu no longer guesses from articles only.
- Added admin-managed column menu.

## Added

- `/admin/columns`
- `columnists` table
- `/columns`
- `/columns/[slug]`

## Admin Columns Menu

You can now:

- add a columnist/column
- hide/show from menu
- delete from menu
- set sort order
- set slug
- set author/category/section match fields
- connect a public column page to the right articles

## SQL to run

`supabase/v210-column-admin-blue.sql`
