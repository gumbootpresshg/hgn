# HGN v231 — Final Pre-Deploy Cleanup

## Fixed

- Article back button no longer renders literal `{backLabelForArticle(article)}` text.
- Header tagline changed to:
  - Independent free local journalism

## Next step: deploy beta

Recommended deployment order:

1. Push project to GitHub.
2. Connect repo to Vercel.
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Add deployed Vercel URL to Supabase Auth redirect URLs.
5. Connect a beta subdomain first:
   - `beta.haidagwaiinews.com`
6. Test admin, articles, marketplace login, events, tides, alerts, mobile menu.
7. Move the main domain once stable.

## SQL

No SQL required.
