# HGN v213 — Columnists Schema Fix

Fixes:

`Could not find the table 'public.columnists' in the schema cache`

## What to do

Run:

`supabase/v213-columnists-schema-fix.sql`

Then refresh the admin page.

## Why this happened

The Columns admin UI was added, but the Supabase table migration had not been run yet in your project.
