# LOCAL-VALIDATION - HGN v0.61.4

The release is labelled LOCAL-VALIDATION.

## Completed in build environment
- Source archive unpacked from HGN v0.61.3.
- All changed TypeScript/TSX files were parsed through the installed TypeScript transpiler successfully.
- Migration reviewed as additive/non-destructive.
- Package integrity checked before delivery.

## Not completed in build environment
`npm install` timed out and left the dependency tree incomplete. `npm run typecheck` therefore stops on missing third-party type libraries (`react`, `node`, `leaflet`, etc.) before application-level type checking can complete.

The user must run:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

on the Windows production checkout before pushing.
