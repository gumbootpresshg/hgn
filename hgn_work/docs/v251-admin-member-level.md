# HGN v251 — Admin Member Level

## Added

A fourth account/member level:

- Admin / Publisher

## What it controls

Admin accounts can access publisher tools under `/admin`.

A user is treated as an admin if their `hgn_profiles` row has any of:

- `account_type = 'admin'`
- `is_admin = true`
- `can_access_publisher_tools = true`

## New files

- `src/components/AdminGate.tsx`
- `src/app/admin/layout.tsx`

## Updated

- Admin Members page can mark someone as Admin / Publisher.
- Admin Members page can remove admin status.
- Account type list includes Admin / Publisher.

## SQL to run

`supabase/v251-admin-member-level.sql`

## Important

After running SQL, go to `/admin/members` and mark your own HGN profile as Admin / Publisher.
