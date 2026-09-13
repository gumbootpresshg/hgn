# Deployment — HGN v0.65.0

1. Run `supabase/v286-publisher-cms-newsstand.sql` in the PUBLIC HGN Supabase project.
2. Preserve `.env.local` and `.git` when overlaying this package onto `C:\HGN\HGNSite`.
3. Run `npm.cmd install`, `npm.cmd run typecheck`, and `npm.cmd run build`.
4. Commit and push `main`; Vercel deploys automatically.

No new environment variables are required.
