# HGN v232 — Reader + Revenue Features

## Added

### Article experience
- Share buttons for Facebook, X, LinkedIn, email and copy link.
- “Listen to this article” browser speech button.
- External link disclaimer component.
- Article back-button fix preserved.

### Marketplace
- Verified seller table:
  - `marketplace_sellers`
- Verified sellers can be used next to auto-approve listings from trusted ad posters.

### Polls
- Poll database tables:
  - `polls`
  - `poll_options`
  - `poll_votes`
- Admin poll page:
  - `/admin/polls`
- Home poll widget component.

### Newsletter
- Newsletter draft table:
  - `newsletter_drafts`
- Admin newsletter starter:
  - `/admin/newsletter`

### Subscriptions
- Subscribe page:
  - `/subscribe`
- Links to:
  - `https://haidagwaiinews.com/subscriptions/`

### Footer
- Social media icon-style links added/stubbed.

## SQL to run

`supabase/v232-reader-revenue-features.sql`

## Notes

The newsletter builder is a starter: it creates drafts/date ranges. The next step is adding article picker and email export/send.
