# HGN v169 — Submission Inbox RLS Fix

This fixes:

`new row violates row-level security policy for table "submission_inbox"`

## What changed

- Public users can insert into `submission_inbox`
- Public users still cannot read the inbox
- Authenticated admin/editor users can review/moderate
- Public letter submit no longer writes to `letters_to_editor`
- `/admin/letters` remains the editor workflow
- `/letters` remains the public approved letters page

## SQL to run

`supabase/v169-submission-inbox-rls-fix.sql`

## Test

1. Run the SQL.
2. Restart dev server.
3. Open `/submit-letter`.
4. Submit a letter with community selected.
5. Open `/admin/letters`.
6. Edit and approve/publish.
7. Open `/letters`.
