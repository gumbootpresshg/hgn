# HGN v0.49.1 — Dedicated Front Page Manager

## Added
- New **Admin → Front Page Manager** page.
- Independent lead-story selector using published articles.
- Standalone front-page photograph upload, with no article required.
- Caption, photo credit, accessibility alt text, optional related article, start date, expiry date, active toggle, preview, replace and remove controls.
- Homepage support for standalone photographs and optional article links.
- Automatic fallback to the existing article-based selections until the new manager is configured.

## Changed
- Article editor now directs editors to the Front Page Manager instead of asking them to mark an article photo as the homepage photograph.
- Added Front Page Manager to the main admin dashboard.
- Version updated to 0.49.1.

## Database
Run `supabase/v265-front-page-manager.sql` before deploying.
