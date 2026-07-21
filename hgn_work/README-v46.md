# HGN v46 Daily Use + Community Pulse

Unzip this patch over `C:\HGN\HGNSite`.

Then run:

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

Run the SQL inside:

```text
supabase/v46-upgrade.sql
```

Adds daily-use pages and admin workflow helpers:
- Today on Haida Gwaii
- Community Pulse poll page
- Admin Daily Desk
- Admin Contributor Plans
- Admin Assignment Board
- safer database columns for events/articles
