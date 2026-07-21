# HGN Website Build v60 — Social + SEO Ops

This upgrade is focused on publisher workflow and Google News readiness groundwork.

## Install

1. Unzip over `C:\HGN\HGNSite`.
2. Run the SQL in `supabase/v60-upgrade.sql` inside Supabase SQL Editor.
3. Run:

```powershell
cd C:\HGN\HGNSite
hgnreset
```

## What this package prepares

- Social post assistant storage (`social_posts`)
- SEO metadata storage (`article_seo` and article SEO fields)
- Article revision storage (`article_revisions`)
- Media library fields for captions, credits, and alt text
- Safer schema columns for Google News/social sharing work

## Next UI pieces

The next UI pass should expose:

- `/admin/social`
- article-level "Create Social Posts" button
- SEO/social preview fields inside the article editor
- media library manager for captions/credits/alt text
