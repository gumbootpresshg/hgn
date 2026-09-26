# HGN v0.66.8 local validation

## Passed

- `npm install`
- `npm run typecheck`
- `npm run build` compiled successfully and completed its TypeScript phase.

## Build limitation

The build stopped while collecting page data for `/_not-found` because this isolated build workspace has no Supabase URL environment variable (`Error: supabaseUrl is required`). No feature compile or type error was reported. This release is therefore marked `LOCAL-VALIDATION`.

Run the normal Windows validation after overlaying the release onto the configured HGN project:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## Required database step

Before deployment, run `supabase/v298-front-page-youtube-feature.sql` in **Public HGN Supabase only**.
