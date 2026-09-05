# Local validation required - v0.60.1

Dependency installation did not complete in the packaging environment. `npm run typecheck` therefore stopped because several installed type-definition packages were missing from the incomplete `node_modules` tree.

Run on the production workstation before deployment:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Only push after typecheck and build pass.
