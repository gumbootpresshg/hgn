# HGN Public v0.60.0

## Editorial usability
- Added a first-class **Columnists** tool to the Newsroom admin workspace.
- Renamed the existing Columns admin screen to **Columnists** and made **+ Add Columnist** prominent.
- Added editable public bio and photo URL fields while preserving the existing columnist matching and public column system.

## Advertising
- Added website ad display sizing independent of the uploaded creative dimensions.
- Ad editor now offers Auto / Recommended, Small (300px), Medium (468px), Leaderboard (728px), Full Width, and Custom max-width modes.
- Article placements default to a sensible 728px maximum in Recommended mode.
- Ad images now preserve aspect ratio with `object-contain` instead of being enlarged/cropped to fill the article width.
- Added `display_mode` and `max_width_px` to the public `ads` table via `supabase/v278-ad-display-sizing.sql`.

## Deployment
Run the v278 migration against the **public HGN Supabase project** before deploying this release.
