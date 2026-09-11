# HGN v0.61.1 Deployment

No Supabase migration is required.

## Validate
```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## Deploy
```powershell
git add --all
git commit -m "Improve mobile front page section balance"
git push origin main
```
