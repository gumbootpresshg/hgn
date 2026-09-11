# HGN v0.60.5

## Article editor + homepage freshness cleanup

- Preserves the v0.60.4 compact article-editor layout for headline, URL slug and subtitle / excerpt, eliminating the large vertical gaps reported in the editor.
- Preserves the one-click **Generate from article** control beside Subtitle / excerpt. It creates an editable excerpt from the article body without replacing manually edited copy.
- Fixes the homepage **Latest Headlines** age labels. They were incorrectly generated from the item's list position (`1h`, `2h`, `3h`, etc.) rather than article publication time.
- Latest Headlines now uses the real `published_at` timestamp: minutes for very recent stories, hours under 24 hours, days under 7 days, and an actual Vancouver-local calendar date for older stories.
- Changes the normal freshness label from red to neutral grey so it does not look like an alert/error.
- No database migration is required.
