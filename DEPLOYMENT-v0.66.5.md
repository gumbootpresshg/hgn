# Deploy HGN v0.66.5

## Run this first in Public HGN Supabase

Run `supabase/v296-public-analytics.sql`.

It is additive and creates an anonymous public-site analytics event table. It does not alter subscribers, newsletter preferences, advertisers, billing, Operations records or existing content.

Do not run this in HGN Operations.

## Enable visitor analytics in Vercel

After deployment, open the HGN Public Vercel project and enable **Analytics** if it is not already enabled. The release includes `@vercel/analytics`, so Vercel will begin recording anonymized visitor and page-view data after the production deployment.

## Optional: show Vercel totals inside HGN Admin

Add these server-only variables in the **HGN Public Vercel project** (not Operations):

- `VERCEL_ANALYTICS_TOKEN` — a Vercel access token with access to the HGN Public project.
- `VERCEL_PROJECT_ID` — the HGN Public Vercel project ID.
- `VERCEL_TEAM_ID` — optional; required only if the project belongs to a Vercel team.

Without these variables, `Admin → Analytics` still shows HGN article, signup and ad measurements, and clearly marks Vercel visitor/page-view totals as unavailable instead of inventing them.
