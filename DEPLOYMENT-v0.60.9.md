# Deployment - v0.60.9

No Supabase migration is required.

Validate on Windows:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Deploy after both checks pass:

```powershell
git add --all
git commit -m "Polish mobile homepage and refresh opinion content"
git push origin main
```
