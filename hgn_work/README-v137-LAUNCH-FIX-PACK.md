# HGN v137 - Launch Fix Pack

This release is a defensive repair and soft-beta launch confidence pass.

## New routes
- `/admin/launch-fix-pack`
- `/launch-fix-status`

## SQL
Run:
- `hgn_v137/supabase/v137-upgrade.sql`

The migration is intentionally defensive:
- uses `create table if not exists`
- uses `alter table ... add column if not exists`
- avoids backslash SQL escaping
- avoids duplicate seed rows

## Recommended order
1. Run the v136 defensive SQL patch if v136 failed partway.
2. Run `v137-upgrade.sql`.
3. Restart the dev server.
4. Open `/admin/launch-fix-pack`.
5. Run one real publish path before online beta.
