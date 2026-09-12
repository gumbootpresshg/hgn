# HGN v0.63.0 — Platform Configuration + AI Source Discovery

## AI Desk / Event Finder
- Added **Discover event sources** to search beyond the manually maintained source list.
- New source lifecycle: Candidate, Trusted, Watch, One-time, Ignored.
- Discovered sources stay inactive until staff review them.
- Candidate source review queue shows where a source was discovered and lets staff classify it.
- One-time sources automatically deactivate after a successful scan.
- Daily scheduled source discovery is included through Vercel Cron when `CRON_SECRET` is configured.
- Trusted/watch sources remain available for normal event research.

## Publication configuration
- Added **Site Configuration** under Platform and Settings.
- Added public navigation editor with rename, reorder, add/remove, show/hide, destination and visibility controls.
- Added Pages & Sections configuration for route labels, visibility, app inclusion and enabled state.
- Added feature switches for Marketplace, Events, Guide, Obituaries, Polls, Newsletter, reader accounts, membership, Weather, Tides, Emergency Alerts and Island Lens.
- `/api/site-config` now exposes both theme/branding and publication platform configuration for website and future mobile apps.
- The public Header consumes the configured navigation instead of relying only on hard-coded menus.

## Separation of responsibilities
- Theme Studio remains the visual-branding editor.
- Site Configuration owns navigation, sections, features and publication structure.
