# Route audit — v0.65.0

## Added
- `/admin/pages`
- `/admin/pages/new`
- `/admin/pages/[id]`
- `/pages/[slug]`
- `/admin/footer`
- `/admin/archives`
- `/digital-paper/[id]`
- `/api/admin/site-pages`
- `/api/admin/site-pages/[id]`
- `/api/admin/archives`
- `/api/admin/archives/[id]`

## Changed
- `/letters` uses strict letter classification instead of broad Opinion matching.
- `/about` and `/about-us` read the managed About page when available.
- `/privacy` and `/terms` are now HGN-specific and can be managed in the CMS after migration.
- `/digital-paper` is now the Archive Newsstand.
- `/request-correction` distinguishes Online, Print and Both.
- `/search` searches multiple public content types.

## Removed
- `/accessibility-status`

## Navigation
- Notices are included in the default Community menu and v286 adds the item once to an existing saved Community menu when missing.
- Footer links are now publisher-managed from `/admin/footer`.
