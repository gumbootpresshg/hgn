# LOCAL-VALIDATION — HGN v0.64.0

This package is labelled **LOCAL-VALIDATION**.

Validation attempted in the build environment:
- `npm install` was started but timed out before completing the dependency tree.
- `npm run typecheck` was attempted and could not run project validation because required type packages were missing from the incomplete install (`react`, `node`, `leaflet`, `estree`, `geojson`, and others).
- Direct TypeScript transpile/syntax checks passed for every changed TypeScript/TSX file.
- A full production `npm run build` was not claimed.

Run the exact validation commands in `DEPLOYMENT-v0.64.0.md` before deployment.
