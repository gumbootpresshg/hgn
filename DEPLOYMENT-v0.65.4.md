# Deploy v0.65.4

No Supabase migration is required.

Optional Vercel environment variables:

- `GOOGLE_SITE_VERIFICATION` — Google Search Console HTML meta verification token.
- `BING_SITE_VERIFICATION` — Bing Webmaster Tools `msvalidate.01` token.
- `INDEXNOW_KEY` — a random 32–128 character key used for IndexNow submissions.

After deployment:

1. Open `/admin/distribution`.
2. Verify `https://haidagwaiinews.com` in Google Search Console.
3. Submit `/sitemap.xml` and `/news-sitemap.xml` in Search Console.
4. Verify the site in Bing Webmaster Tools and submit `/sitemap.xml`.
5. Configure `INDEXNOW_KEY`, redeploy, then use **Test IndexNow** in the Distribution desk.
