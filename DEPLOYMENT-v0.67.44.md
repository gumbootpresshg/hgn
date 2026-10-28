# Deploy HGN v0.67.44

No Supabase migration is required.

This release restores CDN/ISR caching by removing the request-specific CSP nonce. It uses a static CSP, permits inline **styles** needed by Next.js image layout, and continues to block `unsafe-eval`.

The homepage now uses the lead story's own image unless you deliberately choose an independent front-page photo in **Admin → Front Page**. It no longer falls back to an unrelated article image.
