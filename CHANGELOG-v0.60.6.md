# HGN v0.60.6 - Unified publishing dates and timezone

## Added
- New Admin > Settings > Publishing dates & time page.
- Configurable newsroom timezone, defaulting to America/Vancouver.
- Configurable public date style: Sep 10, 2026; September 10, 2026; or 2026-09-10.
- Configurable 12-hour or 24-hour time style.
- Additive public Supabase migration `v280-publishing-date-settings.sql`.

## Fixed
- Article editor date/time field now displays and converts using the configured newsroom timezone instead of the browser/UTC mixture.
- Homepage story dates and Latest Headlines freshness labels use the same publishing settings.
- Article detail pages, article index, section lists, columns and editorials use the shared publishing date formatter.
- UTC remains the storage format in Supabase.

## Notes
- No historical article timestamps are rewritten.
- No destructive database changes are included.
