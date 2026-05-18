# HGN v183 — Ask Annie Pause, Editorial Dates, Event Approval

## Added

- `/admin/events`
- `/api/submit/event`
- Event submissions table
- Public events table
- Approve & publish event workflow

## Changed

- Ask Annie route is paused/hidden for now
- Obvious Ask Annie nav links removed
- Editorial/opinion articles get date backfills

## Where to approve submitted events

Open:

`/admin/events`

There you can:

- Approve & publish
- Pending
- Reject
- Delete

## SQL to run

`supabase/v183-editorial-events-cleanup.sql`
