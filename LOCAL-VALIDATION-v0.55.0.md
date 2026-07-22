# HGN v0.55.0 local validation

This package requires local validation before production deployment.

Run:

```powershell
npm ci
npx tsc --noEmit
npm run build
```

Then run `supabase/v275-theme-studio.sql` in Supabase before using Theme Studio.
