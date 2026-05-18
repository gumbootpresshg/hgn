# HGN v172 — Full Updated Build

This package rolls forward the current beta fixes into one full replacement zip.

## Included recent fixes

- Clean HGN-only project, no PuckScope/NHL leftovers
- Marketplace submissions visible in admin review
- Marketplace approve / pending / reject / delete controls
- Submission queues split correctly
- Letters to the Editor community required
- Letters public submit goes through RPC/inbox path
- Letters editor workflow
- Approve & publish letters without `ON CONFLICT`
- Public `/letters` page for approved letters
- Missing `LaunchCard` component restored

## SQL files to run if not already run

Run only the migrations you have not already applied:

- `supabase/v170-letter-submit-rpc-fix.sql`
- `supabase/v171-letters-publish-no-conflict.sql`

If you skipped earlier marketplace/submission fixes, also run:

- `supabase/v163-classifieds-table-review-fix.sql`
- `supabase/v164-submission-moderation-controls.sql`
- `supabase/v165-submission-queue-split.sql`

## After replacing folder

1. Keep your `.env.local`
2. Keep or reinstall `node_modules`
3. Delete `.next`
4. Run `npm run build`
5. Run `npm run dev`
