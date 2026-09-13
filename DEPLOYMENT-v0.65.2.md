# Deployment v0.65.2

1. Run `supabase/v287-archive-storage-bucket.sql` in the PUBLIC HGN Supabase project.
2. Overlay this release on `C:\HGN\HGNSite` while preserving `.git` and `.env.local`.
3. Run `npm.cmd install`, `npm.cmd run typecheck`, and `npm.cmd run build`.
4. Commit and push `main` only after validation passes.
