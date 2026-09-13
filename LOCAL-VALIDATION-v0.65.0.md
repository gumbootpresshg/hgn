# LOCAL VALIDATION — HGN v0.65.0

Full validation could not be completed in the build environment because `npm install` timed out and left the dependency tree incomplete. `npx tsc --noEmit` then stopped on missing external type packages including React, Node, Leaflet, GeoJSON and related definitions before application type checking could complete.

A direct TypeScript transpile/syntax pass was run against every changed `.ts`/`.tsx` file and passed.

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
