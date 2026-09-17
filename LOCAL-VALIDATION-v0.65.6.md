# HGN v0.65.6 Local Validation

- Direct upload endpoint added at `/api/admin/notices/upload-url`.
- Upload uses a signed Supabase Storage URL and does not send the binary through the Next.js route.
- Public notices now distinguish PDF attachments from image attachments.
- Run the full local TypeScript check and Next.js production build before deployment.
