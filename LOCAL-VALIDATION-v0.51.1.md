# HGN v0.51.1 Local Validation

Completed in the build workspace:

- `npm ci --no-audit --no-fund` passed
- `npx tsc --noEmit` passed
- `npm run build` started optimized production compilation without reporting an error, but exceeded the available build time window
- ZIP integrity check passed after packaging

Before deployment, run:

```powershell
cd C:\HGN\HGNSite
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm ci
npx tsc --noEmit
npm run build
```

Run `supabase/v267-advertising-billing-ai-desk.sql` once in the Supabase SQL Editor before opening the new Operations pages.
