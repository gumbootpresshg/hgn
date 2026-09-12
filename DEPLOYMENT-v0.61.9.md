# HGN v0.61.9 Deployment

No Supabase migration is required.

After overlaying this release onto C:\HGN\HGNSite while preserving .git and local environment files:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

If both checks pass:

```powershell
git add --all
git commit -m "Balance desktop front page sections"
git push origin main
```
