# HGN v0.66.1 — Newsletter Editorial Control

- Fixed the over-stretched Newsletter Settings column; settings now stay compact beside the builder.
- Guide updates are removed from the admin controls and always excluded while the Guide is paused.
- Newsletter lookback and cadence are capped at 28 days; v293 resets the prior 90-day configuration to a two-week editorial window.
- Editors can remove, restore, reorder and save the exact story selection inside an existing newsletter edition.
- New editions include optional current-poll, weather/tides and marketplace promotion blocks that can be switched on or off per edition.
- Active home-page poll is included as a clear Community Pulse block with links back to HGN.
- Added a controlled footer-sponsor house ad: `Newsletter Footer Sponsor · $200`. Replace it with the paid sponsor in Newsletter → Advertising when sold.

## Database

Run `supabase/v293-newsletter-editorial-control.sql` in **Public HGN Supabase** after v291 and v292.

## Validation

- `npm run typecheck` passed.
- `npm run build` is marked local validation when the hosted runner cannot return a final Turbopack result.
