# HGN v0.48.6 deployment

## Required order

1. Keep your existing `.env.local` when extracting this ZIP over `C:\HGN\HGNSite`.
2. Back up Supabase.
3. In Supabase SQL Editor, run `supabase/v260-rls-public-schema-lockdown.sql`.
4. The final query must return zero rows. If SQL reports an error, stop and do not deploy.
5. Test public homepage, marketplace, events, login, article publishing and admin editing.
6. In PowerShell run:

```powershell
cd C:\HGN\HGNSite
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm ci
npx tsc --noEmit
npm run build
npm run dev
```

7. Verify `http://localhost:3000`.
8. Deploy:

```powershell
git add --all
git commit -m "Fix homepage flow and secure Supabase tables"
git push origin main
```

## WAF alert
The WordPress-path scanner was blocked by Vercel WAF and did not produce server errors. No WordPress files are present or added by this release.
