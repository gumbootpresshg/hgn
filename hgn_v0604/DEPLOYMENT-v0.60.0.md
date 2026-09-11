# Deploy HGN Public v0.60.0

1. Back up the current `C:\HGN\HGNSite` folder or ensure the current production commit is safely in Git.
2. Extract this ZIP over `C:\HGN\HGNSite` while preserving `.env.local` and `.git`.
3. In the **public HGN Supabase** SQL editor, run `supabase/v278-ad-display-sizing.sql`.
4. Validate locally:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

5. Deploy:

```powershell
git add --all
git commit -m "Improve ad sizing and columnist management"
git push origin main
```
