# LOCAL VALIDATION - HGN v0.60.3

Automated dependency installation did not complete in the build environment, so TypeScript and the production Next.js build were not claimed as passed here.

Validate on the HGN Windows workstation:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```
