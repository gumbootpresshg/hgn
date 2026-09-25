# Deploy HGN v0.65.9

1. Run `supabase/v291-newsletter-publisher-suite.sql` in the Public HGN Supabase SQL editor.
2. Overlay this release on `C:\HGN\HGNSite`, preserving `.git` and `.env.local`.
3. Run `npm.cmd install`, `npm.cmd run typecheck`, and `npm.cmd run build`.
4. Review `git status` and `git diff --stat`, then commit and push `main`.

## Required existing environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

No new secrets are required.
