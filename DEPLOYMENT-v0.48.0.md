# Deploy HGN v0.48.0

## Supabase

No database migration is required for this update.

## Replace the local project

1. Stop the local development server with `Ctrl+C` if it is running.
2. Make a backup of `C:\HGN\HGNSite` if desired.
3. Extract the ZIP over `C:\HGN\HGNSite` and allow Windows to replace existing files.
4. Do not delete your local `.env.local` file.

## Install and test in PowerShell

Open PowerShell in the project folder:

```powershell
cd C:\HGN\HGNSite

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue

npm config set registry https://registry.npmjs.org/
npm ci
npx tsc --noEmit
npm run build
```

A first build on this project can take time because HGN contains a very large route tree.

To preview locally:

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Deploy through GitHub and Vercel

After the local checks pass:

```powershell
git add --all
git commit -m "Apply modern broadsheet newspaper theme"
git push origin main
```

Vercel will automatically deploy the `main` branch.

## Verify production

Open `https://haidagwaiinews.com` and verify:

- Desktop masthead and section navigation
- Mobile menu and sticky navigation
- Homepage lead story, lead image and right rail
- Latest headlines, events and reader poll
- News, opinion, marketplace, events and obituary pages
- Article pages and article images
- Account login and admin access
- Search and submission forms

If Vercel reports a deployment error, do not redeploy repeatedly. Copy the complete build error into ChatGPT so the exact failing route can be repaired.
