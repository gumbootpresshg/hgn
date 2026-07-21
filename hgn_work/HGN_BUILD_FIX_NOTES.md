# HGN Build Fix Notes

This folder was corrected after the production build still found leftover PuckScope/NHL routes.

The build log showed unresolved imports from old hockey/prospect areas such as `history`, `teams`, `dynasty`, `draft-room`, `player`, and `admin/data-quality`.

Those orphan routes were removed because HGN is now being stabilized as a local news site.

Removed paths:
- `src/app/dynasty` - PuckScope/dynasty leftover route tree
- `src/app/draft-room` - PuckScope draft-room leftover route tree
- `src/app/player` - PuckScope player leftover route tree
- `src/app/history` - NHL draft archive leftover route tree
- `src/app/teams` - NHL teams leftover route tree
- `src/app/api/dynasty` - PuckScope dynasty API leftover
- `src/app/admin/data-quality` - prospect data-quality admin leftover
- `src/lib/dynasty` - PuckScope dynasty library
- `src/data/draftArchive.ts` - NHL draft archive data
- `src/data/nhlTeams.ts` - NHL teams data
- `src/lib/draftArchiveDb.ts` - NHL draft archive library
- `src/lib/draftArchiveStats.ts` - remaining PuckScope/prospect/dynasty/NHL leftover by name
- `src/data/dynasty-demo.ts` - remaining PuckScope/prospect/dynasty/NHL leftover by name

Verification:
- Remaining known bad references from the provided build log: 0
- `node_modules` excluded
- `.next` excluded

Next steps:
1. Replace your current project folder with this one.
2. Run `npm install` if needed.
3. Run `npm run build`.
4. If build reports a new error, send that log and fix only that blocker.
