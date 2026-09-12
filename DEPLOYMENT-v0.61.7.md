# HGN v0.61.7 Deployment

## Required migration
Run in the PUBLIC HGN Supabase project before deploying:

`supabase/v282-incoming-queue-state.sql`

This migration is additive and does not delete source submissions.

## Local validation
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
git commit -m "Add archive and delete controls to incoming queues"
git push origin main
```
