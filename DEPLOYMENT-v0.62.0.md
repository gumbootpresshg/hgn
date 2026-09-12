# HGN v0.62.0 deployment

## 1. Run the public Supabase migration

In the PUBLIC HGN Supabase SQL editor, run:

`supabase/v283-ai-desk-reset.sql`

Do not run this migration in HGN Operations.

## 2. Validate locally

```powershell
cd C:\HGN\HGNSite

Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue

npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## 3. Deploy

```powershell
git add --all
git commit -m "Reset AI Desk research workflow"
git push origin main
```

Vercel deploys `main` automatically.

## 4. Smoke test

1. Open `/admin/ai-desk`.
2. Confirm only News Lead and Event research appear in the normal queue.
3. Confirm low-confidence filter is enabled by default.
4. Open `/admin/ai-desk/event-finder`.
5. Scan one known source over a small date range.
6. Confirm the source produces no more than its configured candidate cap.
7. Open a candidate and confirm source excerpt/missing fields appear.
8. Confirm Promote is disabled until Source verification is `Verified`.
9. Promote one verified event candidate.
10. Confirm the item opens in `/admin/events/[id]` but does **not** appear as a reader item in `/admin/submissions`.
