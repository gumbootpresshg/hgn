# HGN v138 - Production Lock

This upgrade is a launch-stabilization pass for getting HGN online for soft beta testing.

## Added

- `/admin/production-lock`
- `/production-lock-status`
- `src/lib/production-lock.ts`
- `supabase/v138-upgrade.sql`

## Purpose

v138 is intentionally not another broad feature expansion. It is a production lock pass for the two-person admin/editor workflow:

- freeze the soft-beta feature set
- confirm production environment variables
- run public/admin smoke checks
- keep rollback notes visible
- check one real story end to end
- keep the homepage/mobile presentation fresh

## SQL

Run:

```sql
supabase/v138-upgrade.sql
```

The migration is defensive and safe for partial reruns. It uses `create table if not exists` and `alter table ... add column if not exists` before inserts.
