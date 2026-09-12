# HGN v0.61.6 - Admin Simplification Phase 1

## Purpose
Reduce duplicate and confusing admin destinations without deleting public records, specialist workflows, or historical tooling.

## Changes
- Renamed the daily correspondence destination to **Inbox** at `/admin/inbox`.
- Kept `/admin/contact-messages` as a compatibility redirect to `/admin/inbox` so existing bookmarks do not break.
- Reworked the main admin navigation into seven clear work areas: Newsroom, Incoming, Community, Audience, Local Commerce, Island Guide, and Platform.
- Added Inbox and Submissions as the two primary incoming-work destinations.
- Simplified `/admin/submissions` into a read/review overview. Removed aggregate Approve/Reject/Delete controls so specialist workflows remain authoritative.
- Removed raw table names from submission cards and normalized visible statuses into plain language.
- Routed reader photos to Island Lens and marketplace/job items to Marketplace where possible.
- Added an Incoming summary to the admin dashboard with unread message and review counts.
- Added `/admin/site-health` to collect security, submission-protection, moderation and platform diagnostic tools.
- Added publisher-only `/admin/legacy-tools` as a temporary holding page for older newsroom, publishing, beta, launch and foreign-project candidate routes.
- Removed legacy/beta/release utility pages from the normal admin navigation without deleting their code.
- Updated Moderation Desk to link to the real Submissions page rather than the obsolete Submission Desk.

## No destructive changes
- No Supabase tables were dropped or altered.
- No historical submissions were deleted.
- No legacy admin route code was removed in this release.
- No Operations functionality was added back to the public site.
