# HGN v114 - Ship Check

This upgrade adds a lightweight final ship gate for the two-person admin/editor beta workflow.

## New pages

- `/admin/ship-check`
- `/ship-check-status`

## New SQL

- `supabase/v114-upgrade.sql`

## Purpose

Use this before calling the site good for the day. It keeps the final review small:

- homepage lead story
- story/media basics
- image credit/caption/alt text
- mobile check
- SEO basics
- blocker visibility

This is intentionally not a big QA department. It is a small daily check for the two people testing and operating the beta.
