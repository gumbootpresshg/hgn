# HGN Public Site v0.58.0

## Public site to HGN Operations connection

- Added a server-only Operations webhook client.
- Added `/api/public-submissions/notify` as the public-site relay to the private Operations application.
- Uses `HGN_PUBLIC_SITE_WEBHOOK_SECRET`.
- Supports optional `HGN_OPERATIONS_WEBHOOK_URL`; defaults to `https://office.haidagwaiinews.com/api/public-submissions/notify`.
- Webhook delivery is deliberately non-blocking: public submissions remain successful if Operations is temporarily unavailable.
- Added duplicate-safe source IDs for notification records.

## Submission routes connected

- Community events
- Classifieds
- Jobs
- Letters to the editor
- Notices
- Legacy letter submission handler
- Story tips
- Reader photos
- Visitor Guide listings
- Live Map submissions
- Correction requests
- Profile/prospect submissions

## Build tooling

- Added `npm run typecheck`.
- Updated package version to `0.58.0`.

## Deployment environment

The public Vercel project requires:

- `HGN_PUBLIC_SITE_WEBHOOK_SECRET`

Optional override:

- `HGN_OPERATIONS_WEBHOOK_URL`

No Supabase migration is required for this release.
