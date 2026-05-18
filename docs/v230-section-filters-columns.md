# HGN v230 — Section Filters + Official Columns

## Fixed

- Local News now only shows articles tagged/category/section as:
  - Local News
  - News
  - Local
- Local News excludes:
  - columns
  - letters
  - editorials
  - sports
  - Mountie Minute
- Sports now only shows Sports/Sport category or section.
- Mountie Minute now only shows Mountie Minute category or section.
- Editorials now show the actual article author/byline instead of forcing “Haida Gwaii News Editorial Board.”

## Columns updated

Columns menu/list now uses:

- Tlellagram
- Living Out Loud
- Life on the Gwaii
- GKNS Chronicles
- Off Island Antics
- Wisdom Beyond
- Island Cuisine
- Science Matters
- Backseat Life-ing
- Book Talk
- Gallivanting
- Terry's Take
- Sandspit Shingle
- Masset Matters

## SQL

Optional:
`supabase/v230-columnists-list.sql`

Run it if you want these column names also inserted into the admin-managed `columnists` table.
