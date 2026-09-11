# HGN v171 — Letters Publish No Conflict Fix

This fixes the publish error:

`there is no unique or exclusion constraint matching the ON CONFLICT specification`

## What changed

The Letters editor no longer uses:

`upsert(..., { onConflict: "submission_id" })`

Instead it now:

1. Looks for an existing published letter by `submission_id`
2. Updates it if found
3. Inserts a new published letter if not found

## SQL to run

`supabase/v171-letters-publish-no-conflict.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Open `/admin/letters`.
4. Click `Approve & publish`.
5. Open `/letters`.
