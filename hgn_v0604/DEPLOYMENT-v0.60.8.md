# Deployment - v0.60.8

No Supabase migration is required.

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
git add --all
git commit -m "Fix article editor vertical spacing"
git push origin main
```
