# HGN v92 - Homepage Control

This upgrade keeps the beta workflow focused on the current reality: two people testing and operating the site.

## New routes

- `/admin/homepage-control`
- `/homepage-status`

## New SQL

Run:

- `supabase/v92-upgrade.sql`

## What it adds

- Homepage slot control
- Hero/secondary/community/evergreen slot seeds
- Front-page freshness checks
- Stale story indicators
- Simple admin/editor daily homepage checklist
- Lightweight public/internal homepage status page

## Why this matters

Instead of adding more beta infrastructure, v92 is about daily publishing speed and front-page confidence.
