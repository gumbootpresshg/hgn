# HGN v253 — Admin Dashboard + Featured Article Dedupe

## Added

### My HGN
Admins now see a Publisher Tools section inside `/account`.

Shown when profile has:
- `account_type = 'admin'`
- or `is_admin = true`
- or `can_access_publisher_tools = true`

### Article Manager
`/admin/articles` now includes:
- Feature button
- Unfeature button
- featured status

### Homepage
Featured articles are filtered out of lower homepage article lists so they do not repeat farther down the page.

## SQL to run

`supabase/v253-admin-dashboard-featured-dedupe.sql`
