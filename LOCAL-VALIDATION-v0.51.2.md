# HGN v0.51.2 local validation

Completed in the build environment:
- `npm ci`
- `npx tsc --noEmit`
- ZIP integrity check

`npm run build` entered the optimized production build and exceeded the available 180-second window without reporting a compiler error. Run the full build locally before deployment.

No new Supabase migration is required. The v267 migration from v0.51.1 must already be installed.
