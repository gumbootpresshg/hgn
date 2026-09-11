# HGN v0.61.5 Local Validation

Dependency installation timed out in the build environment before TypeScript became available, so a full `npm run typecheck` and `npm run build` could not be completed here.

Run locally before deployment:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy if typecheck or production build fails.
