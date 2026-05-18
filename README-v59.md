# HGN v59 Publisher Platform

This patch focuses on publisher workflow, Google News/social groundwork, and safer beta polish.

Apply by unzipping into your HGN project root and replacing files. Then run:

```powershell
cd C:\HGN\HGNSite
hgnreset
```

Then run the SQL in `supabase/v59-upgrade.sql`.

## Included
- Admin Social Desk scaffold
- RSS/news sitemap route groundwork
- Publisher/social post table schema
- Article SEO/meta helper
- Media metadata schema hardening
