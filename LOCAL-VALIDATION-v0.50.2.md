# HGN v0.50.2 Local Validation

This update fixes the Haida Gwaii Guide dropdown hover/positioning and aligns media upload authorization with the existing AdminGate publisher permissions.

## Validation completed

- TypeScript: `npx tsc --noEmit` passed.
- Upload route permission logic reviewed.
- No Supabase migration required.

## Local commands

```powershell
cd C:\HGN\HGNSite
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm ci
npx tsc --noEmit
npm run build
npm run dev
```
