# HGN v0.65.6 - Notice File Upload

## Added
- Staff can upload notice PDFs and images directly from Admin > Community > Notices.
- Direct signed browser-to-Supabase uploads so notice files do not pass through Vercel request bodies.
- Dedicated `hgn-notices` storage bucket for notice attachments.
- Upload progress and attachment preview/remove controls in the notice editor.
- Public notice cards preview uploaded images and provide clear PDF/open-notice actions.

## Limits
- PDF: 40 MB
- Images: 20 MB
- Allowed image types: JPEG, PNG, WebP, GIF
