# HGN v0.66.5 local validation

- Source audit: confirmed the earlier Analytics Command page was manual snapshot entry and the prior Ad Analytics page did not record impressions.
- Privacy review: the new analytics event payload excludes reader email, IP address, user agent, account identity, billing and Operations data.
- Route review: added `/api/analytics/record` and `/api/admin/analytics`; retained `/api/ad-click` as the redirect/tracking endpoint; `/admin/analytics-command` now redirects to `/admin/analytics`.
- Database review: `v296-public-analytics.sql` is additive and enables RLS without anonymous or authenticated direct-read policies.
- `npm install`: passed; installed `@vercel/analytics` v2.0.1.
- `npm run typecheck`: passed after the final newsletter-ad click tracking change.
- `npm run build`: started, then the hosted sandbox blocked Turbopack from creating a process/binding a port while parsing existing application CSS (`Operation not permitted`). It did not report an application TypeScript or analytics-route error. Run the build in `C:\HGN\HGNSite` before pushing.
- ZIP integrity test: passed. The complete release ZIP excludes `.git`, `node_modules`, `.next`, `.env`, `.env.local` and `*.tsbuildinfo`.
