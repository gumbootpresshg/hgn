# HGN v168 — Letters Inbox Publish Workflow

This fixes the RLS error by changing the workflow:

- Public users submit only to `submission_inbox`
- Editors review/edit in `/admin/letters`
- Approve & publish creates/updates the public `letters_to_editor` record
- `/letters` shows only approved published letters

## SQL to run

`supabase/v168-letters-inbox-publish.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Submit at `/submit-letter`.
4. Open `/admin/letters`.
5. Edit and click `Approve & publish`.
6. Open `/letters`.

The public submit step should no longer touch `letters_to_editor`, so the RLS error should stop.
