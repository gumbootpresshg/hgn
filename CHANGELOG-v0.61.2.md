# HGN v0.61.2 - Front Page Deduplication

## Fixed
- Prevents articles already used as the Top Story, featured/secondary stories, or Opinion feature from reappearing in desktop Latest Headlines.
- Prevents stories shown in Latest Headlines from repeating again in desktop More News / More Local News sections.
- Prevents the mobile Opinion feature from also appearing in mobile Latest Headlines.
- Makes the mobile homepage claim story IDs section-by-section so Latest, More News, Sports, Columns, and More Local News do not repeat one another.
- Preserves newest-first ordering inside each section after duplicate stories are excluded.

## No database changes
No Supabase migration is required for this release.
