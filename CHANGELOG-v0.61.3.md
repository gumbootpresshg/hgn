# HGN v0.61.3 - Article Editor Reliability and Feedback

## Added
- Visible save/publish progress states (`Saving...` / `Publishing...`).
- Persistent `Saved <time>` confirmation after a successful database write.
- `Unsaved changes - protected in this browser` status while the editor has changes that are not yet stored in Supabase.
- Browser-local draft recovery for article edits, including headline, slug, excerpt, body, taxonomy, author, date, image metadata, SEO fields and front-page settings.
- Automatic local draft persistence while editing and an immediate draft snapshot when the page is hidden, backgrounded, unloaded or discarded.
- Recovery of a newer local draft when the article editor is reopened after a refresh/tab discard.
- Standard browser warning when closing/reloading a page with unsaved changes.
- Protection against edits made while a save request is in flight. Newer edits remain marked unsaved and are not overwritten by the completed request.

## Improved
- Article editor save/publish result messages are announced as live status messages.
- Core HGN admin buttons now have a restrained hover lift/glow, pressed state, focus-visible ring and clearer disabled state.
- Newspaper-style buttons now also provide visible hover/press/focus feedback.

## Database
- No Supabase migration required.

## Notes
- Local draft storage is a recovery layer only. Supabase remains the authoritative saved article source.
- Local recovery data is cleared after a confirmed successful save when no newer edits were made during that save.
