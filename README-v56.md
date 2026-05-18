# HGN v56 Island Daily Verified

## Install
Copy/merge these files into `C:\HGN\HGNSite`, then run:

```powershell
hgnreset
```

## SQL
Run the SQL inside:

```text
supabase/v56-upgrade.sql
```

## Adds
- `/island-daily` public daily-use board
- `/admin/daily` daily card review page
- `/admin/launch` beta checklist page
- `IslandDailyStrip` reusable component
- Safe schema hardening for daily/events/notices/obits/marketplace/newsletter/checklist
- Extra launch checklist item for Vercel beta deployment

## Notes
This is a safe patch. It only creates tables/columns if missing and inserts starter rows if absent.
