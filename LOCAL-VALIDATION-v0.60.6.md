# LOCAL-VALIDATION - HGN v0.60.6

Dependency installation did not complete in the build environment before timeout. Because required packages were unavailable, a meaningful TypeScript or Next.js production build could not be completed here.

Run locally before deployment:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not deploy if typecheck or build fails.
