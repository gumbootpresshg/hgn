# LOCAL VALIDATION - HGN v0.60.9

Source review completed for the mobile newspaper polish and content freshness changes.

Full dependency-based validation could not be completed in this environment because `npm install` exceeded the execution window. `npm run typecheck` without installed dependencies is not a meaningful project validation and reported missing React/Next/Supabase packages.

Run on the Windows production working copy before deployment:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy if typecheck or build fails.
