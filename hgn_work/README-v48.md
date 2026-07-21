# HGN Website Build v48 — Launch Ready Polish

Unzip this package over your HGN project folder.

Then run:

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

Run the SQL in:

```text
supabase/v48-upgrade.sql
```

## Focus
- Safer launch SQL that creates/patches missing tables without breaking older databases.
- Community Pulse poll foundation.
- Daily Desk admin workflow.
- Submission Desk admin workflow.
- Homepage helper components for Today/Events/Support/Live Map CTAs.
- Support/donation messaging polish.
- No public accounting/admin buttons.
