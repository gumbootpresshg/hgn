# HGN v185 — Event Editing + Opinion Section Cleanup

## Added

- `/admin/events/[id]`
- Edit submitted events before approval
- Save event edits
- Approve & publish from edit page
- Update already-published event if the submission was previously approved

## Opinion cleanup

Added precise pages:

- `/opinion/editorials`
- `/opinion/on-the-record`

Rules:

- Editorials page excludes On the Record and Letters to the Editor
- On the Record page only shows On the Record content
- Letters to the Editor remains `/letters`

## SQL to run

`supabase/v185-events-opinion-cleanup.sql`
