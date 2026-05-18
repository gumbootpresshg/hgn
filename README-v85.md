# HGN v85 - Rights Desk

This upgrade adds a beta content-rights workflow so HGN can track photo/media permissions, source credits, release forms, and takedown claims before public beta traffic increases.

## New routes

- `/admin/rights-desk` - admin workflow for assets, releases, takedowns and rights tasks
- `/rights` - public-facing rights, credits and takedown-readiness page

## New SQL

Run this migration in Supabase:

- `supabase/v85-upgrade.sql`

## New tables

- `content_rights_assets`
- `content_release_forms`
- `takedown_requests`
- `rights_review_tasks`

## Why this matters for beta

Local news beta launches often move quickly with community photos, supplied images, screenshots, historical material and contributor uploads. This desk gives HGN a safer operational layer for credits, permissions, usage scope, consent/release forms and takedown response.
