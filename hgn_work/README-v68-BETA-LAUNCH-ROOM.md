# HGN v68 — Beta Launch Room

This upgrade adds the final beta launch control layer.

## New pages

- `/admin/launch-room` — go/no-go decision desk, launch task board, beta communications queue
- `/release-notes` — public/beta-reader release notes page

## New SQL

Run this in Supabase after the previous upgrades:

```sql
supabase/v68-upgrade.sql
```

## New database tables

- `beta_launch_decisions`
- `beta_release_tasks`
- `beta_comms_queue`

## What this upgrade is for

v65 added beta command tracking.
v66 added beta operations, incidents and site checks.
v67 added editorial preflight.
v68 connects those into one launch room so you can decide whether the site is ready for closed beta.

## Suggested use

1. Run `supabase/v68-upgrade.sql`.
2. Start the app.
3. Open `/admin/launch-room`.
4. Work through seeded release tasks.
5. Approve or schedule beta communications.
6. Record a formal go/watch/no-go decision.

## Validation notes

TypeScript and Next build were checked during packaging. If your local build differs, run:

```bash
npm install
npm run build
```
