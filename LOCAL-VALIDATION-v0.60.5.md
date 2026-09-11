# HGN v0.60.5 Local Validation

The source changes were completed and reviewed, but dependency installation did not finish within the available build environment. `node_modules/.bin/tsc` was therefore unavailable and a full TypeScript / Next.js production build could not be completed here.

Run locally before deployment:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy if typecheck or build fails.
