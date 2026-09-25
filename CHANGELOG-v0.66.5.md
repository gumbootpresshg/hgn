# HGN v0.66.5 — Audience & Ad Intelligence

## One publisher analytics home

- Rebuilt `Admin → Analytics` as the protected Audience & Ad Intelligence dashboard.
- The older `/admin/analytics-command` route now leads to the new dashboard; its historical manual snapshot records remain preserved.
- Added period controls for today, 7, 30 and 90 days.

## Real reader and content signals

- Added Vercel Web Analytics to the HGN root layout for privacy-conscious visitor and page-view measurement after deployment.
- Added anonymous HGN event reporting for article views, newsletter signups, ad impressions and ad clicks.
- The dashboard shows most-read articles, key reader actions and active-page activity from real recorded events only.

## Advertising reporting

- Rewired display-ad destinations through HGN's click endpoint so live ads record clicks before leaving the site.
- Added viewable-impression tracking: an impression records only after an ad is at least half visible for about one second.
- Added campaign-level impressions, clicks and CTR reporting. Metrics remain aggregate; no advertiser CRM, billing, sales notes or financial data is exposed.
- Newsletter advertising links now pass through the same HGN click tracker before redirecting, so newsletter-ad clicks are also visible. Email ad impressions remain unavailable unless an email provider supplies them.

## Privacy and setup

- The new public analytics table excludes email, IP address, user agent, reader identity and Operations data.
- Vercel visitor/page-view totals appear in HGN Admin once the optional server-only Vercel API settings are added. Until then, the dashboard explicitly shows them as unavailable and Vercel's own Analytics dashboard remains the source of truth.

## Database

- Run `supabase/v296-public-analytics.sql` in the **Public HGN Supabase** project.
