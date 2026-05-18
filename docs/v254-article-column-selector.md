# HGN v254 — Article Column Selector

## Added

Article editing can now assign an article to a columnist column.

## Fields added to articles

- `column_name`
- `column_slug`
- `columnist_name`
- `columnist_id`

## New shared files

- `src/lib/column-options.ts`
- `src/components/admin/ColumnSelector.tsx`

## Patched files

- `src/app/admin/articles/page.tsx`
- `src/app/admin/articles/[id]/page.tsx`

## SQL to run

`supabase/v254-article-column-selector.sql`
