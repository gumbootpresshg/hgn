# HGN v226 — Live Tsunami Alert Feed

## Added

- Live Environment Canada tsunami alert API:
  - `/api/tsunami-alert`
- Site-wide tsunami alert banner:
  - `src/components/TsunamiAlertBanner.tsx`
- Updated tsunami alert page:
  - `/weather/tsunami-alerts`

## Feed

Uses Environment Canada Atom feed:

`https://weather.gc.ca/rss/battleboard/tsu1_t_e.xml`

Zone A:
- North Coast
- Haida Gwaii

## Behaviour

- If feed says “No alerts in effect,” the site shows a green clear-status banner.
- If an alert is active, the site shows a red emergency banner with official alert details.
- Banner refreshes every 5 minutes in the browser.
- API response is revalidated every 5 minutes server-side.

## Dependencies

No new npm package required.

## SQL

No SQL required.
