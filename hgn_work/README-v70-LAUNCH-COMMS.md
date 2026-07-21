# HGN v70 — Launch Communications Center

This upgrade adds a beta communications layer so the beta can be operated publicly and consistently.

## New pages

- `/admin/comms` — beta communications command desk
- `/beta-updates` — public-facing beta update stream

## New SQL

Run this in Supabase after v69:

- `supabase/v70-upgrade.sql`

## Adds

- reusable beta communications templates
- public/internal beta update posts
- message queue scoring
- public beta updates page
- admin tools for queue review/approve/schedule/sent status

## Recommended flow

1. Run `supabase/v70-upgrade.sql`
2. Restart the dev server
3. Open `/admin/comms`
4. Review seeded templates and public beta updates
5. Share `/beta-updates` with testers once ready
