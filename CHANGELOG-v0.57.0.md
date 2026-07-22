# HGN v0.57.0

## Print circulation
- Added print subscriber database and renewal fields.
- Added Avery 5160/8160 mailing-label printing for active, island, off-island and complimentary segments.
- Added distribution locations with regular, summer and winter copy targets.
- Added print issue records and issue-by-issue delivered/returned entry.
- Added pickup/sell-through calculations and basic circulation dashboard.
- Added label-run history table for accountability.

## AI Desk events
- Added **Find upcoming events** workspace with start/end date selection.
- Added managed event-source library.
- Added server-side source scanning that creates review-only AI Desk event drafts.
- Added duplicate protection against existing events and same-scan results.
- Keeps source URLs, verification status and scan range attached to each draft.
- No event is published automatically.

## Database
Run `supabase/v277-print-circulation-event-finder.sql`.
