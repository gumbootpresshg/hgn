# Deployment - HGN v0.61.0

No Supabase migration is required.

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build

git add --all
git commit -m "Unify public content ordering and event feeds"
git push origin main
```
