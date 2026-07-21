# HGN v71 Trust + Corrections Upgrade

This upgrade adds a beta trust layer for public accountability and newsroom triage.

## New routes

- `/admin/trust` - admin Trust Desk for correction requests and public trust notes
- `/trust` - public corrections and transparency log
- `/request-correction` - reader correction/clarification request form

## New SQL

Run this migration in Supabase after your normal reset/bootstrap flow:

- `supabase/v71-upgrade.sql`

## New tables

- `trust_items`
- `correction_requests`

## Why this matters for beta

Before public beta, HGN needs a clear process for handling reader-reported errors, broken links, missing context, privacy concerns and article clarifications. This upgrade gives the newsroom both an internal triage queue and a public transparency log.
