# LOCAL-VALIDATION - HGN v0.60.2

The source was reviewed and packaged in the build environment. Dependency installation could not complete within the available execution window, so TypeScript and the Next.js production build were not claimed as passed here.

Run locally before pushing:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```
