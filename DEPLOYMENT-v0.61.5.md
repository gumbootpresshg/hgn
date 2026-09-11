# HGN v0.61.5 Deployment

No Supabase migration is required.

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

If validation passes:

```powershell
git add --all
git commit -m "Unify public submission desk"
git push origin main
```
