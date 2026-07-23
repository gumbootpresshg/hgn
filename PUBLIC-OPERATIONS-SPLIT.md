# Public HGN and HGN Operations

## Public HGN (`haidagwaiinews.com`)
Reader-facing publishing, editorial workflows, community submissions, events, weather, alerts, marketplace, visitor guide, newsletter, reader accounts, Theme Studio, AI Desk and public advertising information.

## HGN Operations (`office.haidagwaiinews.com`)
Print circulation, subscriber addresses, labels, distribution and returns, advertiser/customer records, sales opportunities, campaigns, billing, Square reporting, financial summaries and internal operational notes.

## Submission delivery
Set `HGN_PUBLIC_SITE_WEBHOOK_SECRET` in the public Vercel project. The public site sends non-blocking notices to the Operations receiver after a public record is saved. Optional override: `HGN_OPERATIONS_WEBHOOK_URL`.
