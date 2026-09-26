# HGN v0.66.8 — Front-Page YouTube Live Feature

## Front-page broadcast feature

- Adds a publisher-controlled YouTube live/video feature to **Admin → Front Page**.
- Supports public YouTube watch, live, short, and share URLs; only recognized YouTube video IDs are embedded.
- Lets editors set a headline, short description, optional start time, optional stop time, and a manual on/off switch.
- When enabled, the video replaces the front-page photo cleanly on both desktop and mobile. Turning it off immediately restores the normal photo.
- The mobile layout uses a full-width 16:9 player below the top story, with no desktop-only side-rail controls or overflow.

## Database

- Adds `supabase/v298-front-page-youtube-feature.sql`.
- The migration is additive and changes only Public HGN front-page editorial settings. It contains no viewer, supporter, advertising, billing, or Operations data.
