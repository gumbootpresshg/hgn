# HGN v0.50.3 Local Validation

Completed in the packaging environment:

- `npm ci`
- `npx tsc --noEmit`
- media upload route import and permission-helper checks
- ZIP integrity test

The optimized Next.js build started normally and reached `Creating an optimized production build`, but exceeded the available execution window before completion. Run `npm run build` locally with the production `.env.local` before deployment.

No Supabase migration is required.
