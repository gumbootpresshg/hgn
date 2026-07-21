# HGN v0.52.3 - Newsletter Article Query Repair

## Fixed

- Removed the invalid `articles.summary` field from the newsletter builder query.
- Uses the existing `excerpt` field first and the legacy-compatible `dek` field as fallback.
- Restores Build Newsletter, preview population, and test-send preparation.
- No Supabase migration is required.
