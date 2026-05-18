# HGN v53 Reader Experience

This package builds on v52 and focuses on reader experience + beta polish.

## Install
Unzip into `C:\HGN\HGNSite` and replace files.

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

Or if you created the shortcut:

```powershell
hgnreset
```

## Supabase
Run the SQL inside:

```text
supabase/v53-upgrade.sql
```

## Focus
- safer schema hardening
- reader experience polish
- daily-use CTAs
- event/notices/obituary stability
- ad placement table hardening
- launch checklist admin support
