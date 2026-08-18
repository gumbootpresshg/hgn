# HGN Public v0.60.0 - LOCAL VALIDATION

Dependency installation did not complete in the build environment, so TypeScript and the production Next.js build were not verified here.

## Required public Supabase migration
Run this file in the **public HGN Supabase project** before deployment:

`supabase/v278-ad-display-sizing.sql`

It only adds two nullable/defaulted columns to `public.ads` and is idempotent.

## Local validation
From `C:\HGN\HGNSite`:

```powershell
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy until typecheck and build both pass.

## Deployment

```powershell
git status
git add --all
git commit -m "Improve ad sizing and columnist management"
git push origin main
```
