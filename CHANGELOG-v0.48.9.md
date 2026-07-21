# HGN v0.48.9 - Navigation Cleanup, Menu State Fix, Tagline and Favicon

## Navigation

- Reorganized the public navigation to the approved newspaper structure:
  - News: Latest Stories, Local News, Mountie Minute, Sports
  - Opinion: Columns, Letters to the Editor, Submit a Guest Opinion
  - Weather
  - Community: Events, Obituaries, Ferry Info
  - Marketplace: existing listing and posting links
  - Horoscopes
- Removed Explore Haida Gwaii from the public navigation until that section is ready to return.
- Removed duplicate top-level Obituaries navigation because it now lives under Community.

## Dropdown behaviour

- Desktop dropdowns now close immediately when a destination is selected.
- All menus close automatically after a route change.
- Escape closes open desktop and mobile menus.
- Clicking outside the navigation closes desktop dropdowns.
- Mobile navigation closes after any destination is selected.

## Branding

- Replaced the favicon with the selected black-and-white HGN serif monogram.
- Generated browser favicon, 512px application icon, and 180px Apple touch icon.
- Changed the masthead tagline to: The Islands' News Source Since 2024.

## Database

- No new Supabase migration is required for v0.48.9.
- If the v260 RLS migration from v0.48.6 has not been run yet, it remains included and should be handled separately before deployment.
