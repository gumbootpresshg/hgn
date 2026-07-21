# HGN v129 - Online Beta Hardening

This is a larger launch-readiness upgrade focused on getting HGN online for a two-person admin/editor soft beta.

## New routes

- `/admin/online-beta-hardening`
- `/online-beta-status`

## New SQL

Run:

- `supabase/v129-upgrade.sql`

## What this adds

- online beta hardening checklist
- live route smoke-test tracker
- rollout steps for upload, post-upload checks, and rollback readiness
- decision log for feature-freeze discipline
- public readiness status page

## Direction

From here, avoid adding new admin desks unless they simplify or replace existing workflow. The priority is upload readiness, mobile polish, homepage confidence, article quality, SEO basics and production stability.
