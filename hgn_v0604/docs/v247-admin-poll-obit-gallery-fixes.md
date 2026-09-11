# HGN v247 — Admin, Poll, Obituary, Gallery Fixes

## Fixed

- Reader poll now shows results after voting.
- Admin polls can delete old polls and related votes/options.
- Obituaries page no longer errors when `death_date` is missing.
- SQL adds missing obituary fields safely.
- Island Lens admin can create complete galleries:
  - title
  - intro/header text
  - body/story text
  - photo URLs
  - video URLs
  - thumbnail
- My HGN dashboard boxes no longer say “Open”.
- Admin pages are no longer empty placeholder text only.
- Admin Business Directory route added/fixed.

## Events

Homepage event box should hide times only on the front page. The normal `/events` page still keeps times.

## SQL to run

`supabase/v247-admin-poll-obit-gallery-fixes.sql`
