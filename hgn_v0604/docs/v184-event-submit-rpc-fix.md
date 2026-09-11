# HGN v184 — Event Submit RPC Fix

Fixes:

`new row violates row-level security policy for table "event_submissions"`

## SQL to run

`supabase/v184-event-submit-rpc-fix.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Submit at `/submit-event`.
4. Open `/admin/events`.
5. Approve & publish.
