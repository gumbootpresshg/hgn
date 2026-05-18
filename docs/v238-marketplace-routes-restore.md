# HGN v238 — Marketplace Routes Restore

## Fixed

Tailwind/Next dev error:

`ENOENT: no such file or directory, stat 'src/app/marketplace/my-listings/page.tsx'`

## Restored

- `/marketplace/my-listings`
- `/marketplace/post`

## Local cache note

If the error still appears after installing this package, stop the dev server and run:

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

## SQL

No SQL required.
