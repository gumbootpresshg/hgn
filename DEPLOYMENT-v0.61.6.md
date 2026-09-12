# Deploy HGN v0.61.6

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
git commit -m "Simplify public admin navigation and incoming workflows"
git push origin main
```

Vercel deploys `main` automatically.
