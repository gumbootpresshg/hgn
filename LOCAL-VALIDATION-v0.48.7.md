# HGN v0.48.7 Local Validation

Keep the existing `.env.local` file in the project root.

```powershell
cd C:\HGN\HGNSite
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm ci
npx tsc --noEmit
npm run build
npm run dev
```

Open `http://localhost:3000` and inspect the homepage at 100% and 33% zoom.

Confirm:

- More Local News columns no longer leave a large blank rectangle beside the advertisement.
- The advertisement appears after the two-column story flow.
- The right rail remains independent.
- Existing articles, events, marketplace, login, and admin routes still work.
