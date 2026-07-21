# HGN v51 Schema Hardening + Beta Polish

This package is mainly a safe Supabase patch to stop upgrade scripts from failing on older/missing tables or columns.

## Install
1. Copy/replace files if included.
2. Run `supabase/v51-upgrade.sql` in Supabase SQL Editor.
3. Then run:

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

## Focus
- Safer missing-table/missing-column handling
- Events, notices, obituaries, marketplace, ads, newsletter, staff room, live map table hardening
- Sample starter records only when tables are empty
