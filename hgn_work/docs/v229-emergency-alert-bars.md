# HGN v229 — Emergency Alert Bars

## Fixed

- Site-wide tsunami banner no longer shows the green “no alerts” state.
- The July 30 timestamp still appears on the tsunami status page because it is the official Environment Canada feed update timestamp, but it no longer clutters the front page.
- Site-wide tsunami banner now appears only if the official feed reports an active alert.

## Added

- Earthquake alert API:
  - `/api/earthquake-alert`
- Earthquake alert banner:
  - `src/components/EarthquakeAlertBanner.tsx`
- Earthquake page now shows recent regional earthquake feed.
- Site-wide earthquake banner appears only for:
  - magnitude 4.0+
  - within 350 km of Haida Gwaii
  - within the last 24 hours

## Sources

- Environment Canada tsunami Atom feed
- USGS Earthquake Hazards Program API
- Earthquakes Canada regional links

## Best practice

This keeps the front page clean when there is no emergency, but makes emergency information impossible to miss when something important happens.

## SQL

No SQL required.
