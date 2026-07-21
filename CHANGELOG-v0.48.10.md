# HGN v0.48.10 - Viewport-safe dropdown menus

## Fixed

- Repositioned desktop dropdown menus relative to the browser viewport instead of the individual menu trigger.
- Prevented the large Opinion/Columns menu from extending beyond the left or right edge of the screen.
- Added responsive side padding so wide dropdowns remain fully visible on smaller desktop windows.
- Recalculates dropdown position while scrolling, when the sticky navigation activates, and when the browser is resized.
- Preserved route-change, link-click, Escape-key, outside-click, and mobile-menu closing behaviour from v0.48.9.

## Database

No Supabase migration is required.
