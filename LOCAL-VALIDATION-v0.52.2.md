# Local validation v0.52.2

- `npm ci`: passed
- `npx tsc --noEmit`: passed
- `npm run build`: entered optimized production compilation, but exceeded the available validation window before completion
- Required migration: `supabase/v273-newsletter-reliability-account.sql`

This package is labelled LOCAL-VALIDATION because the full production build did not complete within the available window.
