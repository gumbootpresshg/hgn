# Deployment - HGN v0.60.6

1. Run `supabase/v280-publishing-date-settings.sql` in the PUBLIC HGN Supabase project.
2. Copy this source over `C:\HGN\HGNSite` while preserving `.git` and `.env.local`.
3. Run:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

4. If validation passes:

```powershell
git add --all
git commit -m "Unify publishing dates and newsroom timezone"
git push origin main
```

Vercel deploys `main` automatically.
