# HGN v0.48.3 Deployment

No Supabase migration is required.

1. Extract this ZIP over `C:\HGN\HGNSite`.
2. Keep the existing `.env.local` file.
3. Open PowerShell in `C:\HGN\HGNSite`.
4. Run:

```powershell
npm ci
npx tsc --noEmit
npm run build
```

5. Test locally if desired:

```powershell
npm run dev
```

Open `http://localhost:3000` and confirm the homepage no longer requests `/news-placeholder.jpg`.

6. Deploy:

```powershell
git add --all
git commit -m "Fix HGN fallback news image"
git push origin main
```

Vercel will deploy automatically from `main`.
