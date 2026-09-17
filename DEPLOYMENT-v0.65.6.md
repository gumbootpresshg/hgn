# HGN v0.65.6 Deployment

1. Run `supabase/v289-notice-file-upload.sql` in the public HGN Supabase project.
2. Overlay this source onto `C:\HGN\HGNSite`, preserving `.git`, `.env.local`, `node_modules`, and `.next` exclusions.
3. Run `npm.cmd install`, `npm.cmd run typecheck`, and `npm.cmd run build`.
4. Commit and push to `main`.
5. Test Admin > Community > Notices with one image notice and one PDF notice.
