# HGN v144 - Security Hardening

This upgrade continues the v143 submission alert work and adds a focused online beta security hardening pass.

## Added

- `/admin/security-hardening`
- `/security-hardening-status`
- `src/lib/security-hardening.ts`
- `supabase/v144-upgrade.sql`

## What to verify before upload

1. Admin routes require login.
2. Letter submissions can be created publicly but cannot be listed publicly.
3. Submission alert settings and logs are private.
4. Service-role keys stay server-side only.
5. Production environment variables are not exposed with `NEXT_PUBLIC_` unless safe.

## SQL

Run `hgn_v144/supabase/v144-upgrade.sql` in Supabase after installing this package.
