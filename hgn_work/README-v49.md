# HGN Website Build v49 Launch Polish

Copy these files into your HGN project root. This package is designed as a safe overlay patch.

## Steps

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

Then copy/paste the SQL in `supabase/v49-upgrade.sql` into Supabase SQL Editor.

## Focus
- Daily-use homepage support components
- Safer missing-table SQL
- Admin workflow tables for submissions, newsletter, events, assignments
- No-dead-end public pages support tables
