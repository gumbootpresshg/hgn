# HGN v0.48.1

## Correction

- Corrected the masthead tagline from `Serving the islands since 1995` to `Serving the Islands since 2024`.
- Updated the project version from 0.48.0 to 0.48.1.

## Database

- No Supabase migration is required.

## Deployment

1. Extract this ZIP over the local HGN project.
2. Preserve the existing `.env.local` file.
3. Open PowerShell in `C:\HGN\HGNSite`.
4. Run:

```powershell
npm ci
npx tsc --noEmit
npm run build
git add --all
git commit -m "Correct HGN founding year"
git push origin main
```

Vercel deploys automatically from `main`.
