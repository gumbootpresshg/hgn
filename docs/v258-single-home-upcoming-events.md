# HGN v258 — Single Homepage Upcoming Events Box

## Fixed

- Removed duplicate homepage Upcoming Events boxes.
- Removed old hardcoded prompt cards:
  - Submit your community event
  - Community event submissions open
- Kept one official component:
  - `src/components/HomeUpcomingEvents.tsx`

## Event date compatibility

The homepage event box now reads any of these date fields:

- `start_date`
- `event_date`
- `date`
- `starts_at`
- `created_at`

So older published events should show even if they were saved before the newer start/end date fields existed.

## SQL

No SQL required.
