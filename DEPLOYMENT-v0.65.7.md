# Deployment - v0.65.7

1. Run `supabase/v290-notices-save-publish-fix.sql` in the public HGN Supabase project.
2. Overlay this release on `C:\HGN\HGNSite`.
3. Run `npm.cmd install`, `npm.cmd run typecheck`, and `npm.cmd run build`.
4. Commit and push to `main`.
