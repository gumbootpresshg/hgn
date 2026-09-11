# Deployment - HGN v0.60.4

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
git commit -m "Polish article editor and add excerpt generator"
git push origin main
```
