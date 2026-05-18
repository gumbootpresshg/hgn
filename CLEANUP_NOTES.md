# PuckScope cleanup notes

This replacement package was cleaned to make this chat/project the PuckScope source of truth.

## Removed

- generated `.next` output
- local `.env` files
- Vercel local project metadata
- previous backup folders
- cross-project newspaper/community routes
- unrelated WordPress/news import scripts
- unrelated branding assets and copy

## Preserved

- Next.js app structure
- PuckScope player/ranking/team/mock-draft/stat routes
- Supabase client and PuckScope SQL files
- import scripts for rankings, players, stats, videos, draft history, and team prospect pools
- dynasty/draft-room hockey tooling where it was product-relevant

## Important after unzip

Run:

```bash
npm install
npm run dev
```

Then recreate `.env.local` with your Supabase values. It was intentionally not included in the zip.
