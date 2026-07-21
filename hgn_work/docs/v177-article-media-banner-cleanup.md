# HGN v177 — Article Media + Banner Cleanup

This update adds article photo upload support and starts cleaning duplicate article banner/ad clutter.

## Added

- `src/lib/article-image-upload.ts`
- Article image upload in `/admin/content/articles/[id]`
- Saves uploaded image URL to `articles.image_url`
- Supports:
  - `image_alt`
  - `image_caption`
  - `image_credit`
- Supabase Storage bucket setup for `hgn-media`
- `/admin/media` guidance page
- `ArticleImage` display component

## Banner cleanup

The package checked the article page for duplicate bottom ad placements and removed obvious repeated placements where safe.

Detected cleanup notes:
- No exact duplicate bottom ad placement strings were safely removed automatically.

## SQL to run

`supabase/v177-article-media-banner-cleanup.sql`

## Supabase Storage

The SQL creates/updates bucket:

`hgn-media`

Policies:
- public read
- authenticated upload/update/delete

## Test

1. Run SQL.
2. Restart dev server.
3. Open `/admin/content`.
4. Edit an article.
5. Upload a photo.
6. Add alt text/caption/credit.
7. Save.
