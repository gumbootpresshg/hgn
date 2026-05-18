# HGN v57 Media Pipeline

This upgrade adds the first serious media/photo infrastructure for HGN.

## What it adds

- `media_assets` table
- `article_images` table
- Supabase Storage buckets
- optimized image upload API
- image metadata: caption, photographer credit, alt text
- reusable `ArticleImage` component
- reusable `ImageUploadBox` component
- admin media library at `/admin/media`
- article page now displays image caption/credit/alt text

## Install

1. Copy files into the project.
2. Run SQL:
   `supabase/v57-upgrade.sql`
3. Install sharp:
   `npm install sharp`
4. Run:
   `hgnreset`

## Original photo archive

The website should store optimized web images only. Full-resolution originals should be kept in a separate archive such as:

- local drive/NAS
- Google Drive
- OneDrive

Suggested archive folders:

- `HGN Photo Archive/Articles/YYYY/MM/`
- `HGN Photo Archive/Events/YYYY/MM/`
- `HGN Photo Archive/Obituaries/YYYY/MM/`

