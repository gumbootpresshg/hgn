# HGN v0.66.9 local validation

## Passed

- `npm install`
- `npm run typecheck`

## Build limitation

`npm run build` began the Next.js optimized production build but the isolated execution environment stopped before completion and did not generate `.next/BUILD_ID`. No compile or type error was reported. This release is marked `LOCAL-VALIDATION`.

Run the normal Windows validation after overlaying the release onto the configured HGN project:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## Required database step

Before deployment, run `supabase/v299-island-lens-photo-features.sql` in **Public HGN Supabase only**.
