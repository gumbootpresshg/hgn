# Local validation — v0.65.4

Run:

```powershell
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Then inspect:

- `/admin/distribution`
- `/news-sitemap.xml`
- `/sitemap.xml`
- `/rss.xml`
- `/feeds/news.xml`
- `/feeds/opinion.xml`
- `/feeds/sports.xml`
- `/atom.xml`
- a recent `/articles/...` page source for NewsArticle JSON-LD
- an `/authors/...` page source for Person JSON-LD
