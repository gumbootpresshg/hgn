# LOCAL-VALIDATION - HGN v0.61.6

Full validation could not complete in the build environment because `npm install` exceeded the execution window and left an incomplete dependency tree.

Observed result from `npm run typecheck` after the interrupted install: TypeScript stopped on missing dependency type packages (`estree`, `geojson`, `json-schema`, `json5`, `leaflet`, `node`, `react`, `react-dom`, `sanitize-html`, `ws`) before application typechecking could complete.

A direct TypeScript syntax/transpile check passed for every file changed in v0.61.6.

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
