# Deploy HGN v0.60.3

This release fixes article publication-date timezone display. No Supabase migration is required.

After copying the release over the existing `C:\HGN\HGNSite` while preserving `.git` and `.env.local`:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build

git add --all
git commit -m "Fix article publication date timezone"
git push origin main
```
