# HGN v0.52.1 Local Validation

- `npm ci`: passed
- `npx tsc --noEmit`: passed
- `npm run build`: reached optimized production compilation, but the available validation window ended before completion
- No database data or environment files are included

Required migration: `supabase/v272-newsletter-automation.sql`

Required production variable for sending: `RESEND_API_KEY`
Recommended variables: `NEXT_PUBLIC_SITE_URL=https://haidagwaiinews.com` and `CRON_SECRET`

The default database settings are manual mode with approval required. The scheduled route does nothing until an administrator explicitly enables automatic mode.
