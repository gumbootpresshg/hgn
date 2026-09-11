# HGN v160 — Controlled Beta Release Candidate

This is stability pass 3 and the release candidate for controlled beta.

## Rule

After this package, stop major feature waves.

During beta, only fix:
- blocking build/deploy issues
- security/auth problems
- submission/alert failures
- mobile/readability problems
- obvious reader confusion
- publishing workflow blockers

## Required checks

1. Run `hgn_v160/supabase/v160-upgrade.sql`
2. Run `npm install`
3. Run `npm run build`
4. Confirm admin routes require login
5. Submit one test Letter to the Editor
6. Confirm alert delivery
7. Check homepage and one story on mobile
8. Share with a small controlled group only

## Deployment note

Keep the previous working zip and database state available as rollback.
