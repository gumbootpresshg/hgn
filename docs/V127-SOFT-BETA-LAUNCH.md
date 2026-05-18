# HGN v127 Soft Beta Launch Cockpit

This upgrade is a bigger launch-readiness pass.

## New routes

- `/admin/soft-beta-launch` — go-live cockpit for the two-person admin/editor beta
- `/beta-ready` — simple readiness status page

## New SQL

Run:

```sql
supabase/v127-upgrade.sql
```

## Why this exists

HGN has enough workflow tooling now. v127 is about upload readiness: homepage quality, mobile sanity, publishing simulation, RSS/sitemap checks, and parking unfinished admin areas before soft beta.

## Recommended next step after install

Do not add features immediately. Run one real publishing simulation and use `/admin/soft-beta-launch` as the checklist.
