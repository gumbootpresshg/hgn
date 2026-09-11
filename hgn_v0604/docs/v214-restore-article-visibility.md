# HGN v214 — Restore Article Visibility

## Fixed

- Local News no longer depends on too-narrow generic filters.
- Sports uses broader sports matching.
- Mountie Minute uses broader RCMP/public safety matching.
- Columns menu no longer depends only on `columnists`.
- Columns now merge:
  - admin-managed columnists
  - detected column fields from published articles
  - fallback column names
- Column pages match articles by:
  - author
  - byline
  - category
  - section
  - column_name
  - column
  - slug/title
- Editorial pages use Editorial Board and preserve editorial routing.

## Added

- `src/lib/article-routing.ts`
- restored article helper logic for author/back links/section matching

## SQL

No new SQL required if v213 has already been run.
