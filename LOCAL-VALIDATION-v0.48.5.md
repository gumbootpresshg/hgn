# HGN v0.48.5 Local Validation

This release changes homepage layout flow only. Keep your existing `.env.local` when extracting the ZIP.

```powershell
cd C:\HGN\HGNSite
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm ci
npx tsc --noEmit
npm run build
npm run dev
```

Open `http://localhost:3000` and verify:

1. Supporting stories appear below the lead photo instead of a large blank block.
2. The four-story strip does not duplicate those supporting stories.
3. More Local News fills both columns naturally without paired empty gaps.
4. Events and poll remain in the independent right rail.
5. Desktop, tablet, and mobile layouts remain readable.
