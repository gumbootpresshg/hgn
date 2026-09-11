# HGN v0.61.2 Local Validation

The release source was updated and structurally reviewed. Full TypeScript/build validation could not complete in this environment because the installed dependency tree is incomplete. `tsc` stops on missing type definition packages (`react`, `node`, `leaflet`, `estree`, `geojson`, and others) before checking application code.

Validate on the HGN Windows workstation:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy if typecheck or build fails.
