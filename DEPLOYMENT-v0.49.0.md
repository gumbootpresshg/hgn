# HGN v0.49.0 Deployment

## Required first step: Supabase

Back up the Supabase project, then run this file in the Supabase SQL Editor:

`supabase/v264-front-page-photo.sql`

Do this before deploying the website. The update adds the independent front-page photo field and photo metadata columns.

## Replace the local project

Extract this ZIP over:

`C:\HGN\HGNSite`

Keep the existing `.env.local` file. It is intentionally not included in this package.

## Validate in PowerShell

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

Open `http://localhost:3000` and verify:

1. The top story can be text-only.
2. The large homepage photo can belong to a different article.
3. The photo caption and credit display correctly.
4. Text-only cards do not show HGN logo placeholders or blank thumbnail boxes.
5. The article editor saves alt text, caption, credit, and front-page photo selection.
6. Selecting a new front-page photo clears the previous selection.

Stop the local server with `Ctrl+C`.

## Deploy

```powershell
git add --all
git commit -m "Add text-first stories and front-page photo controls"
git push origin main
```

Vercel deploys automatically from `main`. Verify `https://haidagwaiinews.com` after deployment.
