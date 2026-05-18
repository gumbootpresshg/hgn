# HGN v212 — Live Desk Source Upgrade

## Improved

- Ferry Info now uses direct BC Ferries route/current condition links:
  - Prince Rupert ↔ Skidegate
  - Skidegate ↔ Alliford Bay
- Tide Desk now has individual local station pages.
- Weather town pages are more useful local desks.
- Earthquake page now points to Earthquakes Canada regional/live feeds.
- Tsunami page now points to Environment Canada, PreparedBC and EmergencyInfoBC.
- Added shared source file:
  - `src/lib/hgn-live-links.ts`

## Notes

These pages use official external links for current data. Direct embedded live data/API parsing can be added later if desired.

## SQL

No SQL required.
