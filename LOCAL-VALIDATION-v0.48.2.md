# HGN v0.48.2 Local Validation

This package contains the Option 1 masthead update and is intended for validation on the HGN computer that already has the real `.env.local` file.

## Important

- Extract this ZIP over `C:\HGN\HGNSite`.
- Keep the existing `C:\HGN\HGNSite\.env.local` file.
- Do not deploy until the production build passes on your computer.
- No Supabase migration is required.

## 1. Open PowerShell

```powershell
cd C:\HGN\HGNSite
```

## 2. Stop any running local server and clear the previous build

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
```

## 3. Install dependencies and run production checks

```powershell
npm config set registry https://registry.npmjs.org/
npm ci
npx tsc --noEmit
npm run build
```

Do not deploy if any command ends with an error.

## 4. Test the design locally

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Check the masthead on desktop and mobile. Stop the server with `Ctrl+C`.

## 5. Deploy only after the build passes

```powershell
git add --all
git commit -m "Refine HGN masthead typography"
git push origin main
```

Vercel will deploy from the `main` branch. Verify the live site at `https://haidagwaiinews.com`.
