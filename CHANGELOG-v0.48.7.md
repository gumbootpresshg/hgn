# HGN v0.48.7 - Homepage Column Balance Fix

## Homepage layout

- Removed the tall house advertisement from inside the left More Local News column.
- Kept both More Local News columns dedicated to story cards so they finish at similar heights.
- Moved the home-middle advertisement beneath the complete two-column story flow.
- Constrained the advertisement to a centered editorial width instead of allowing it to create a tall empty neighbouring column.
- Preserved the independent main-content and right-rail layout introduced in v0.48.6.

## Security

- Preserved the v0.48.6 Supabase RLS migration unchanged.
- No additional database migration is required beyond `supabase/v260-rls-public-schema-lockdown.sql` if it has not already been run.

## Version

- Updated project version to 0.48.7.
