# HGN v0.48.9 Deployment

No new Supabase migration is required for this update.

Extract this ZIP over `C:\HGN\HGNSite` and keep the existing `.env.local` file.

Run in PowerShell:

```powershell
cd C:\HGN\HGNSite
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm config set registry https://registry.npmjs.org/
npm ci
npx tsc --noEmit
npm run build
npm run dev
```

Test locally at `http://localhost:3000`.

Verify desktop and mobile navigation, every dropdown destination, Escape behaviour, outside-click closing, the new tagline, and the favicon.

Deploy only after the build succeeds:

```powershell
git add --all
git commit -m "Simplify navigation and fix menu closing"
git push origin main
```
