# HGN v257 — Homepage Upcoming Events Real Events Only

## Fixed

The front-page Upcoming Events box should no longer show:
- Submit your event
- Community event submissions open
- submission prompt cards

## Added

A dedicated homepage component:

`src/components/HomeUpcomingEvents.tsx`

It only loads from `events` where status is:
- published
- approved
- active
- live
- public

It also filters prompt-style titles just in case they exist in the events table.

## Notes

The homepage event box shows date only.
The `/events` page should still show full event times.

## SQL

No SQL required.
