# HGN v153 — Online Beta Share Gate

This upgrade adds a final share-readiness gate before showing HGN to real readers.

## Checks

- Homepage ready to share
- First story end-to-end
- Letter alert verified
- Admin pages private
- Rollback notes ready

## Recommended order

1. Run `hgn_v153/supabase/v153-upgrade.sql`
2. Open `/admin/online-beta-share-gate`
3. Check homepage on phone and desktop
4. Review one complete story
5. Submit one test Letter to the Editor
6. Confirm admin pages are private
