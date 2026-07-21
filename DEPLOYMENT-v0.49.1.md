# HGN v0.49.1 Deployment

## 1. Run the Supabase migration first
Open Supabase SQL Editor and run:

`supabase/v265-front-page-manager.sql`

## 2. Replace the local project
Extract this ZIP over `C:\HGN\HGNSite` and keep your existing `.env.local`.

## 3. Validate in PowerShell
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

Open `http://localhost:3000`, then test:
- Admin → Front Page Manager
- selecting and saving a lead story
- uploading a standalone photo
- caption, credit and alt text
- optional related article link
- start and expiry dates
- homepage desktop and mobile layouts

## 4. Deploy after the build passes
```powershell
git add --all
git commit -m "Add dedicated front page manager"
git push origin main
```
