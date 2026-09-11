# HGN v0.60.1 deployment

This release requires no Supabase migration.

The public Vercel project must retain these existing server-side variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HGN_PUBLIC_SITE_WEBHOOK_SECRET`

The webhook secret must not use a `NEXT_PUBLIC_` prefix.

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
git commit -m "Fix public contact form"
git push origin main
```
