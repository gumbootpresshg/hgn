# LOCAL-VALIDATION - HGN v0.61.1

Validation could not complete in the build environment because the dependency install timed out after an incomplete `node_modules` tree. The initial TypeScript attempt failed only because installed type packages were missing from that incomplete dependency tree.

Run locally on Windows:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy if typecheck or build fails.
