# HGN v235 — Admin Dashboard Links

## Fixed

Polls and Newsletter Builder existed as routes but were not visible from the publisher/admin dashboard.

## Added to `/admin`

### Publishing
- Articles
- Letters to the Editor
- Events
- Polls
- Newsletter Builder

### Revenue
- Ad Manager
- Marketplace / Classifieds
- Columns Menu

### Community Tools
- Business Directory
- Visitor Guide
- Explore Haida Gwaii
- Live Utilities

## SQL

No SQL required if v232 SQL has already been run.

If Polls throws a table error, run:

`supabase/v232-reader-revenue-features.sql`
