# HGN v167 — Letters Editor Workflow

This update turns Letters to the Editor into a real editor workflow.

## Added

- Community is mandatory on submit
- `/admin/letters`
- Editor can edit subject/headline
- Editor can edit letter body
- Editor can add private notes
- Approve & publish
- Pending
- Reject
- Delete
- Public `/letters` page shows approved letters immediately

## SQL to run

`supabase/v167-letters-editor-workflow.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Submit a letter at `/submit-letter`.
4. Open `/admin/letters`.
5. Edit the body or subject.
6. Click `Approve & publish`.
7. Open `/letters`.
8. The edited approved letter should show right away.
