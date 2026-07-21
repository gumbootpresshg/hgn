# HGN v244 — Navigation / Opinion Cleanup

## Requested changes

- Removed Support Us from the top menu.
- Marketplace menu no longer includes Sign In / Sign Up.
- Columns should live under Opinion, not as a standalone top-level item.
- Opinion submenu structure:
  - Editorials
  - Columns
    - Tlellagram
    - Living Out Loud
    - Life on the Gwaii
    - GKNS Chronicles
    - Off Island Antics
    - Wisdom Beyond
    - Island Cuisine
    - Science Matters
    - Backseat Life-ing
    - Book Talk
    - Gallivanting
    - Terry's Take
    - Sandspit Shingle
    - Masset Matters
  - On the Record
  - Cartoons
  - Letters to the Editor
  - Submit a Guest Opinion
  - Submit a Letter

## Added pages

- `/cartoons`
- `/submit-guest-opinion`
- `/submit-letter`

## Added shared navigation config

- `src/lib/navigation.ts`

This gives one clean source for the desired nav structure if Header needs a future stronger refactor.

## SQL

No SQL required.
