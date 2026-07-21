# HGN v66 — Beta Operations Desk

This upgrade turns the v65 Beta Command Centre into a more complete beta operating system.

## New pages

- `/admin/beta-ops` — incident board, release notes, site checks and go/no-go dashboard
- `/beta-status` — simple beta-facing status page for testers and trusted readers

## New shared logic

- `src/lib/beta-ops.ts`
  - safe Supabase reads
  - readiness snapshot
  - tone/status helpers

## New SQL

Run this in Supabase after your reset/bootstrap:

```sql
supabase/v66-upgrade.sql
```

The migration adds:

- `beta_incidents`
- `beta_release_notes`
- `beta_site_checks`

It also seeds practical site checks for:

- homepage
- article pages
- feedback form
- RSS
- news sitemap
- submission desk
- beta status page

## Recommended order

```bash
npm install
node hgnreset.js
```

Then run:

```sql
supabase/v66-upgrade.sql
```

Then:

```bash
npm run dev
```

## Why this upgrade matters

v65 helped organize beta readiness. v66 adds the daily operating layer:

- what is broken
- what changed
- what testers should know
- what checks are green/yellow/red
- whether beta is safe to widen

This is a beta-hardening release, not a feature-sprawl release.
