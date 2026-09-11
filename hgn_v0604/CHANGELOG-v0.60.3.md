# HGN v0.60.3 - Article Date Timezone Fix

## Fixed
- Fixed the article editor publication date/time field displaying the next calendar day for Pacific-time users.
- The editor now formats saved UTC timestamps into the browser's local date/time before displaying them in the `datetime-local` control.
- User-selected local date/time values are still converted to ISO UTC timestamps before being saved to Supabase.
- Existing publication timestamps are not migrated or rewritten.

## Validation
Run locally:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```
