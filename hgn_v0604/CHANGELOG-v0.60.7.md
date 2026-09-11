# HGN v0.60.7

## Fixes
- Fixed TypeScript typing for authenticated fetch headers on Admin > Settings > Publishing.
- Prevents `HeadersInit` errors when there is no active session token.
- No database migration required beyond the existing v280 publishing settings migration.

## Important local cleanup
If a stray `hgn_v0604` folder exists inside `C:\HGN\HGNSite`, remove it before typecheck/build. That duplicate source tree is not part of the application and causes every TypeScript error to appear twice.
