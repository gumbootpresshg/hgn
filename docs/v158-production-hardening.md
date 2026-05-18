# HGN v158 — Production Hardening

This is stability pass 1 from the v157 freeze point.

## Rule

No new major systems. No new feature sprawl.

## Focus

- Admin route protection
- Supabase environment safety
- Submission form validation
- Mobile overflow checks
- Empty/loading/error states

## Recommended order

1. Run `hgn_v158/supabase/v158-upgrade.sql`
2. Open `/admin/production-hardening`
3. Check admin routes while logged out
4. Confirm production environment variables
5. Submit a test Letter to the Editor
6. Review mobile homepage and article pages
