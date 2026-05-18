# HGN v55 Private Beta Plus

This is a safe beta-hardening patch.

## Install
Copy/merge these files into C:\HGN\HGNSite, then run:

```powershell
hgnreset
```

## SQL
Run:

```text
supabase/v55-upgrade.sql
```

## Adds
- Safe schema hardening for evolved tables
- Admin private beta control room: /admin/beta
- Public tester feedback page: /beta-test
- Launch checklist rows
- Beta feedback table
- Fewer missing-column SQL surprises

## Notes
This patch is intentionally conservative. It avoids risky destructive changes and should run safely over your existing database.
