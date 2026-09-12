# Deployment - HGN v0.61.8

No new Supabase migration is required beyond `v282-incoming-queue-state.sql` from v0.61.7.

Run locally:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Then deploy:

```powershell
git add --all
git commit -m "Fix incoming queue TypeScript headers"
git push origin main
```
