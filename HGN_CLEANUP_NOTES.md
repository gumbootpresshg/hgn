# HGN Cleaned Folder Notes

This package was cleaned from the uploaded AGENTS.zip folder.

Removed:
- `.next` — generated/cache/dependency folder
- `supabase.zip` — nested archive file
- `ProspectsBackup.code-workspace` — unrelated prospect/PuckScope/hockey leftover by filename
- `imports/rankings.csv` — unrelated prospect/PuckScope/hockey leftover by filename
- `imports/team-prospect-pools-template.csv` — unrelated prospect/PuckScope/hockey leftover by filename
- `public/og-puckscope.svg` — unrelated prospect/PuckScope/hockey leftover by filename
- `public/puckscope-mark.svg` — unrelated prospect/PuckScope/hockey leftover by filename
- `scripts/dailyfaceoff-rankings-bot.mjs` — unrelated prospect/PuckScope/hockey leftover by filename
- `scripts/import-rankings-csv.mjs` — unrelated prospect/PuckScope/hockey leftover by filename
- `scripts/import-team-prospect-pools-csv.mjs` — unrelated prospect/PuckScope/hockey leftover by filename
- `scripts/rankings-bot.mjs` — unrelated prospect/PuckScope/hockey leftover by filename
- `scripts/sportsnet-rankings-bot.mjs` — unrelated prospect/PuckScope/hockey leftover by filename
- `scripts/thn-rankings-bot.mjs` — unrelated prospect/PuckScope/hockey leftover by filename
- `scripts/thw-rankings-bot.mjs` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_admin_data_control.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_contributor_writer_system.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_draft_archive.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_draft_archive_data_engine.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_live_engine.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_live_stats_prospect_pools.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_mock_draft_challenge.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_prospect_builder.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_publishing_room.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `supabase/puckscope_stats_cleanup_starter.sql` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/pipeline-rankings` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/rankings` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/data/prospects.ts` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/data/rankings.ts` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/lib/prospectStatus.ts` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/lib/dynasty/puckscope-live.ts` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/lib/dynasty/puckscope-news.ts` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/admin/prospect-builder` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/api/run-rankings-bot` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/draft-room/my-prospects` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/dynasty/rankings` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/dynasty/submit-prospect` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/dynasty/admin/rankings` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/dynasty/media-universe/power-rankings` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/dynasty/_components/HockeyAtmosphere.tsx` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/dynasty/_components/LiveRankingsClient.tsx` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/dynasty/_components/ProspectCard.tsx` — unrelated prospect/PuckScope/hockey leftover by filename
- `src/app/api/dynasty/prospects` — unrelated prospect/PuckScope/hockey leftover by filename
- `README-V21.md` — old root README version clutter
- `README-V22.md` — old root README version clutter
- `README-V23-FRESH.md` — old root README version clutter
- `README-V24-FRESH.md` — old root README version clutter
- `README-V25-FRESH.md` — old root README version clutter
- `README-V26-PATCH.md` — old root README version clutter
- `README-V27-FIXES.md` — old root README version clutter
- `README-V28.md` — old root README version clutter
- `README-V30.md` — old root README version clutter
- `README-V31-DEMO.md` — old root README version clutter
- `README-V32-EDITOR.md` — old root README version clutter
- `README-V33-DEMO-POLISH.md` — old root README version clutter
- `README-V34-HEADER-SUPPORT.md` — old root README version clutter
- `README-V35-HEADER-FIX.md` — old root README version clutter
- `README-V38-NAVIGATION-CLEANUP.md` — old root README version clutter
- `README-V41.md` — old root README version clutter
- `README-V42.md` — old root README version clutter
- `README-V43.md` — old root README version clutter
- `README-V44.md` — old root README version clutter
- `README-V47.md` — old root README version clutter
- `README-V74-SOURCE-DESK.md` — old root README version clutter
- `README-V89.md` — old root README version clutter
- `README-V99.md` — old root README version clutter
- `README-V139-LAUNCH-REHEARSAL.md` — old root README version clutter
- `README-V141-BRAND-POLISH.md` — old root README version clutter
- `next.config.ts` — duplicate Next config; kept next.config.mjs

Kept:
- app/source files
- public assets
- Supabase migrations
- docs
- package files
- lockfiles, if present

Not included:
- `node_modules`
- `.next` build output

Recommended next steps:
1. Replace your existing project folder contents with this cleaned folder.
2. Keep or reinstall `node_modules` separately with `npm install` if needed.
3. Run the latest SQL migration you have not yet applied.
4. Run `npm run dev` or your normal local start command.

Config notes:
- Kept next.config.mjs as the active Next config.
