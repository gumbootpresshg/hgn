# HGN v0.47.0 Deployment Instructions

This ZIP is a complete project package. Extract it over your existing local HGN project so the included files replace the matching local files.

## Supabase

No new Supabase database migration is required for this release.

## Recommended local check

Open PowerShell in the project folder and run:

```powershell
npm ci
npx tsc --noEmit
npm run build
```

Do not deploy if any command reports an error.

## Deploy to production

After the local checks pass, run:

```powershell
git add --all
git commit -m "Harden HGN security navigation and SEO"
git push origin main
```

Vercel is connected to the `main` branch and will automatically create the production deployment.

## Verify after Vercel deploys

Open https://haidagwaiinews.com and verify:

1. The homepage, article pages, marketplace, events, Opinion menu, and mobile menu load normally.
2. The Opinion dropdown does not create a scroll box on desktop.
3. Signed-out visitors cannot open protected admin tools.
4. A normal member cannot open publisher/admin tools.
5. A publisher/admin can still open the newsroom and upload article images.
6. Article formatting and images display correctly.
7. `/robots.txt`, `/sitemap.xml`, `/news-sitemap.xml`, and `/rss.xml` load.
8. The browser console does not show new CSP or JavaScript errors.

If the Vercel build fails, do not promote or alter production manually. Keep the previous successful deployment active and use the Vercel build log to identify the failing route.
