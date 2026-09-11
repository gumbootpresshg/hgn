# HGN v176 — Articles Body NOT NULL Fix

This fixes the failed SQL error:

`null value in column "body" of relation "articles" violates not-null constraint`

## Why it happened

Some older imported article rows have missing `body` / `content`, but your database requires `body`.

## Fixed

- Never writes null to `articles.body`
- Backfills body/content from excerpt, dek, title, or safe placeholder
- Sets safe defaults for future article rows
- Reapplies article RLS/editor policies
- Keeps the v175 content library usable

## SQL to run

Run this instead of the failed v175 article normalization section:

`supabase/v176-articles-body-not-null-fix.sql`

Then open:

`/admin/content`
