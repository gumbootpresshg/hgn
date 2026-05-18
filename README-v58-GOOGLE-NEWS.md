# HGN v58 — Media + Google News

This patch adds Google News-friendly infrastructure:

- `/rss.xml`
- `/news-sitemap.xml`
- `/sitemap.xml`
- `/robots.txt`
- NewsArticle JSON-LD schema on article pages
- Open Graph and Twitter metadata
- image alt/caption/credit fields
- Google News include flag

## Install

Unzip over `C:\HGN\HGNSite`, then run:

```powershell
cd C:\HGN\HGNSite
hgnreset
```

Run SQL:

```text
supabase/v58-upgrade.sql
```

## Important before public beta

Set this in `.env.local` and later in Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://haidagwaiinews.com
```

For beta testing you can use your Vercel preview URL.
