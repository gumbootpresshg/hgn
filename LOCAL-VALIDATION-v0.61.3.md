# LOCAL-VALIDATION - HGN v0.61.3

The source changes and package structure were reviewed in the build environment.

A full dependency install could not complete within the available execution window. The partial install did not contain required React/Node/Leaflet type packages, so `npm run typecheck` stopped on missing dependency type definitions before application TypeScript could be fully validated.

This release therefore requires local validation on the HGN Windows workstation:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not treat this package as production-validated until both commands pass locally.
