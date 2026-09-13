# HGN v0.63.1 - Navigation Flash & Visibility Fix

## Fixed
- Public navigation configuration is loaded on the server before the first HTML render.
- Hidden, disabled and staff-only menu entries no longer appear briefly before disappearing.
- Saved theme configuration is passed into the client provider on the first render instead of starting from the default theme and changing after hydration.
- Navigation visibility now distinguishes public, logged-in, member and staff audiences.
- Anonymous visitors receive a conservative public-only navigation on first paint.
- Logged-in/member/staff-only links are revealed only after the current reader account is resolved in the browser.
- Public site configuration is refreshed through ISR with a 10-second revalidation window.

## Technical changes
- Added `src/lib/server/public-site-config.ts` as the shared server-side site configuration loader.
- `/api/site-config` now reuses the same loader.
- `RootLayout` loads site configuration before rendering Header and ThemeProvider.
- `Header` receives initial platform configuration from the server and no longer performs an initial `/api/site-config` fetch.
- `SiteThemeProvider` accepts initial server-provided theme configuration.

## Database
No Supabase migration is required.
