# HGN v225 — Missing On The Record Route Fix

Fixes build error:

`ENOENT: no such file or directory, stat 'src/app/on-the-record/page.tsx'`

## What changed

- Restored safe placeholder route:
  - `src/app/on-the-record/page.tsx`

## If error continues locally

Stop the dev server and clear cache:

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

No SQL required.
