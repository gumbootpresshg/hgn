# HGN v0.61.2 Deployment

1. Copy this release over `C:\HGN\HGNSite`, preserving `.git` and `.env.local`.
2. Clear generated Next.js/TypeScript caches.
3. Install dependencies, typecheck, and build.
4. Commit and push to `main` only after validation passes.

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build

git add --all
git commit -m "Deduplicate homepage story sections"
git push origin main
```
