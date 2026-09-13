# HGN v0.65.1 Deployment

No Supabase SQL migration is required for this release.

Validate:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Deploy:

```powershell
git add --all
git status --short
git commit -m "Fix large archive uploads"
git push origin main
```
