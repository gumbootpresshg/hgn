# HGN v256 — Event Submission Dates + Homepage Event Filter

## Added

Event submissions now support:
- all-day events
- start date
- end date
- start time
- end time

## Fixed

Homepage Upcoming Events should filter out submission prompt items such as:
- Submit your community event
- Community event submissions open

The normal `/events` page keeps event times.

## SQL to run

`supabase/v256-event-submission-dates-home-filter.sql`
