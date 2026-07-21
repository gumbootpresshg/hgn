# HGN v0.48.3 - Placeholder Image Fix

## Changed

- Corrected all default news-image references from `/news-placeholder.jpg` to the existing `/news-placeholder.svg` asset.
- Updated homepage fallback images, shared image utilities, SEO/Open Graph fallback metadata, and the site-wide default image setting together.
- Removed the homepage 404 caused by requests for the missing JPG placeholder.
- Updated the project version from 0.48.2 to 0.48.3.

## Database

- No Supabase migration is required.

## Validation

- The v0.48.2 base package passed a complete Next.js production build on the deployment computer with `.env.local` present.
- This release changes only four fallback image paths plus version and release documentation.
