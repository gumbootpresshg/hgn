# HGN v0.61.4 - Writers & Columns System

## Added
- New `/admin/authors` writer management page.
- New public `/authors` directory.
- New public `/authors/[slug]` writer profile pages with photo, bio, columns and published article history.
- Active author dropdowns in both new-article and article-edit publishing flows.
- Writer-to-article relationship through `articles.writer_id` while preserving historical `author_name`/`author` text.
- Writer-to-column relationship through `columnists.author_id`.
- Author photo upload using the existing `article-images` public storage bucket.

## Improved
- Renamed the admin concept from Columnists to Columns where the record represents a recurring column series.
- Rebuilt `/admin/columns` as a compact searchable list with click-to-expand editing instead of rendering every form at once.
- Columns can be activated/deactivated without deleting historical links.
- Authors can be activated/deactivated without deleting historical articles.
- Selecting a column in the article editor automatically selects its linked writer when one is configured.
- Public article bylines link to the writer profile when a linked active writer exists.
- Public `/columns` now reads active database-managed columns first, with the historical static list only as a fallback.
- Public column pages show the linked writer and link to the writer profile.
- The Opinion > Columns navigation now loads active database-managed columns, with the existing list as a fallback if the database is unavailable.

## Security
- Tightened author management RLS to newsroom/admin users.
- Tightened the legacy `columnists_authenticated_manage` policy so ordinary authenticated reader accounts cannot manage columns.

## Migration
Run `supabase/v281-writers-columns.sql` against the PUBLIC HGN Supabase project.
The migration is additive and preserves existing articles and columns. It also seeds writer records from existing article bylines and backfills links where names match.
