# HGN v0.48.4 Local Validation

This release fixes the oversized homepage lead headline, dead space below the lead image, and the hard-to-distinguish sticky navigation.

The TypeScript check passed in the packaging environment. The complete Next.js build must be run on the deployment computer because the production `.env.local` is intentionally not included in the ZIP.

```powershell
cd C:\HGN\HGNSite
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm ci
npx tsc --noEmit
npm run build
npm run dev
```

Open http://localhost:3000 and test the homepage at desktop and mobile widths. Scroll past the lead story and verify the sticky menu remains legible without covering content.

No Supabase migration is required.
