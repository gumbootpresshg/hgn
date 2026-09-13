# Deployment — HGN v0.64.0

## 1. Database migration
Run this file in the **public HGN Supabase project** SQL editor:

`supabase/v285-ai-newsroom-automatic-discovery.sql`

The migration is additive and does not delete existing AI Desk items, events, sources or settings.

## 2. Environment variables
Keep the existing public-site variables. Automatic daily discovery requires:

`CRON_SECRET`

No new search-engine API key is required in v0.64.0.

## 3. Local validation
```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## 4. Deploy
```powershell
cd C:\HGN\HGNSite
git add --all
git commit -m "Simplify AI Desk and automate local event discovery"
git push origin main
```

Vercel deploys `main` automatically.
