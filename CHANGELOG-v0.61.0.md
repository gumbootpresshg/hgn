# HGN v0.61.0 - Public Content Consistency

## Reader-facing fixes
- Latest Headlines now always uses the newest published articles instead of leftover stories after homepage slot deduplication.
- Homepage Opinion now selects the newest eligible opinion item chronologically rather than preferring older featured content.
- More Local News now uses shared taxonomy and a larger chronological candidate pool so newer specifically-tagged local stories are not skipped.
- Public article section lists now use one published-status rule.
- `/articles` now uses shared Opinion/Letter classification instead of a separate category exclusion list.
- Public events now use the canonical `events` table created by the approval workflow. `event_submissions` remains the intake/review queue.

## Mobile polish
- Homepage Upcoming Events hides completely when there are no future events.
- Reader Poll choices are compact 48px+ touch rows instead of oversized cards.
- Footer top spacing is reduced on mobile while preserving desktop spacing.
- Added consistent mobile scroll offset support for anchored content under the sticky header.

## Data safety
- No tables are dropped and no historical records are rewritten.
- No Supabase migration is required for this release.
