# LOCAL-VALIDATION - HGN v0.63.1

Full project validation did not complete in the build environment.

`npm install` timed out and left the dependency tree incomplete. `npm run typecheck` then stopped on missing ambient type packages including React, Node, Leaflet, GeoJSON and related definitions before reaching meaningful application-level checking.

The changed TypeScript/TSX files were independently passed through the installed TypeScript transpiler with diagnostics enabled:

- `src/components/Header.tsx`
- `src/components/theme/SiteThemeProvider.tsx`
- `src/app/layout.tsx`
- `src/app/api/site-config/route.ts`
- `src/lib/server/public-site-config.ts`

All changed files passed that syntax/transpile check.

Run the normal local validation commands before deployment:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```
