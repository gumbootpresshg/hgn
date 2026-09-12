# HGN v0.61.7 - Incoming Queue Cleanup

## Inbox
- Added permanent Delete action for contact messages with confirmation.
- Kept Archive/Restore as the normal non-destructive cleanup path.
- Delete is performed through an authenticated server-side admin API.

## Submissions
- Added Active / Archived / Trash views.
- Added per-item Archive, Delete, and Restore controls.
- Added select-all and bulk Archive/Delete/Restore actions.
- "Delete" in the unified submission queue is recoverable: it removes the item from the active intake queue without deleting the source record from Letters, Events, Obituaries, Marketplace, etc.
- Queue state follows the canonical source record ID, so webhook mirror rows do not reappear after cleanup.
- Specialist publishing/review actions remain in their proper workspaces.

## Security / data safety
- Added server-side authenticated queue-state API.
- No public browser writes directly to the new queue-state table.
- No specialist source records are deleted by the unified Submissions page.
