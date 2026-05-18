# HGN v233 — Article Listen Runtime Fix

## Fixed

- Runtime error on article pages:
  - `ReferenceError: article is not defined`
- The Listen To Article component was accidentally inserted at module level.
- It is now placed inside the article page render where `article` exists.
- Preserves:
  - article share buttons
  - listen to article
  - external link disclaimer
  - corrected back button label

## SQL

No SQL required.
