# HGN v0.61.5 - Unified Public Submission Desk

## Fixed
- Rebuilt `/admin/submissions` so it no longer depends primarily on `submission_inbox`.
- Aggregates the real public intake tables used by HGN forms, including letters, events, story tips, corrections, reader photos, notices, obituaries, Visitor Guide items, Live Map items, marketplace/classifieds, and job submissions.
- General contact messages remain intentionally separated in Contact Messages.
- Added source/type badges, sender/date metadata and chronological sorting across all sources.
- Added direct handoffs to specialist workspaces for Letters, Events, Corrections, Obituaries, Visitor Guide and Live Map.
- Kept moderation controls only on queues that can safely be moderated from the unified desk.
- Missing optional historical tables no longer prevent the rest of the Submission Desk from loading.

## Database
- No Supabase migration required.
- No records or tables are deleted.
