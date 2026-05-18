# HGN v118 - Newsroom Consolidation

This upgrade starts the consolidation phase.

## New routes

- `/admin/newsroom-hub`
- `/newsroom-hub-status`

## New SQL

Run:

```sql
supabase/v118-upgrade.sql
```

## Purpose

HGN already has enough workflow desks. v118 creates a lighter two-person admin/editor hub so daily publishing can start from one place.

Use this to:

- pick the next useful publishing move
- keep homepage freshness visible
- avoid jumping through every admin screen
- preserve only the admin tools that are useful during the beta

## Notes

No backslash SQL escaping is used in this migration.
