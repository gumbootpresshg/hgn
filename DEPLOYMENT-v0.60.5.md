# HGN v0.60.5 Deployment

No Supabase migration is required.

## Validate locally

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
git commit -m "Polish article editor and fix headline freshness labels"
git push origin main
```

Vercel deploys automatically from `main`.
