# HGN v234 — Pre-Deploy Article + Revenue Cleanup

## Fixed

- Listen to this article is placed above the article body.
- Article page no longer crashes from misplaced article variables.
- Article page no longer shows external-link disclaimer under every article.
- External-link disclaimer now belongs on utility/emergency pages.
- Header utility links shortened:
  - Advertise
  - Contact
  - About
- Bottom of article pages now includes:
  - share buttons
  - more from this column
  - articles from other columnists
  - more to read

## Poll note

The home poll only appears once a poll exists in `/admin/polls` with:

- status: `published` or `active`
- Show on home page: checked

If no poll exists, it hides cleanly.

## Subscriptions

`/subscribe` now has built-in subscription tier cards. Replace each `squareUrl` in `src/app/subscribe/page.tsx` with the proper Square checkout link when ready.

## SQL

No new SQL required beyond v232.
