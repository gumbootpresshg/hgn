# HGN v0.66.7 local validation

## Passed

- `npm install`
- `npm run typecheck`

## Build limitation

`npm run build` began the Next.js optimized production build, then the execution sandbox stopped before completion and left an incomplete `.next/lock`; no `BUILD_ID` was generated. No project compile error was reported. This release is therefore marked `LOCAL-VALIDATION`.

Run the normal Windows validation after overlaying the release:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## Required database step

Before deployment, run `supabase/v297-support-page-reader-contributions.sql` in **Public HGN Supabase only**.
