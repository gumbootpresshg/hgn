# Local validation — HGN v0.62.0

Status: **LOCAL-VALIDATION**

Attempted in the packaging environment:

- `npm install` — timed out and left an incomplete dependency tree.
- `npm run typecheck` — could not complete because required type packages such as React, Node, Leaflet, GeoJSON and others were not fully installed.
- Changed TypeScript/TSX files were passed through the installed TypeScript parser/transpiler and reported no syntax diagnostics.

Required validation on the HGN workstation before deployment:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy if typecheck or build fails.
