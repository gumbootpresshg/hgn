# HGN v52 Production Push

This is a safer production-push package for the current HGN beta.

## Install
Unzip into `C:\HGN\HGNSite` and replace files.

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

## Supabase
Run:

```text
supabase/v52-upgrade.sql
```

The SQL is intentionally defensive: it creates missing tables and adds missing columns before inserting sample/demo records.

## Adds
- safer schema hardening for older tables
- launch checklist admin page at `/admin/launch-checklist`
- stronger Daily Use rail component
- support/events/live-map/notice CTA cleanup
