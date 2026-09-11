# HGN v170 — Letter Submit RPC Fix

This fixes the persistent error:

`new row violates row-level security policy for table "submission_inbox"`

## What changed

Public letter submissions now call:

`public.submit_letter_to_editor(...)`

That function is `SECURITY DEFINER`, so it can insert the row safely while keeping the inbox private.

## SQL to run

`supabase/v170-letter-submit-rpc-fix.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Submit at `/submit-letter`.
4. Open `/admin/letters`.
5. Edit and approve/publish.
6. Open `/letters`.

Public users still cannot read the inbox.
