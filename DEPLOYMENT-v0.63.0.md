# HGN v0.63.0 deployment

1. Run `supabase/v284-platform-config-source-discovery.sql` in the PUBLIC HGN Supabase project.
2. Add `CRON_SECRET` to the public HGN Vercel project if you want daily automatic source discovery. The manual Discover button works without the cron secret.
3. Preserve `.env.local` and `.git` when copying this release over `C:\HGN\HGNSite`.
4. Validate:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

5. Deploy:

```powershell
git add --all
git commit -m "Add platform configuration and AI source discovery"
git push origin main
```
