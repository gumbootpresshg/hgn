# HGN v250 — Members/Auth/Home Events

## Fixed

- Login/signup redirect now goes to `/account`.
- `/login` and `/account` create missing `hgn_profiles` rows for signed-in users.
- Admin Members can add, verify, badge, mark paid, mark business, and delete profiles.
- Homepage event time display patched again in `src/app/page.tsx`.
- `/events` page was not changed and keeps times.

## SQL to run

`supabase/v250-members-auth-home-events.sql`
