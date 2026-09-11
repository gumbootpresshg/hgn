# LOCAL VALIDATION - HGN v0.61.0

Source review and package checks completed.

The full TypeScript/build validation could not complete in the build environment because the existing dependency tree is incomplete and `npm install` timed out. The attempted `npm run typecheck` stopped on missing installed type packages such as React/Node/Leaflet before project-source type checking.

Run on the HGN Windows workstation:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy if typecheck or build fails.
