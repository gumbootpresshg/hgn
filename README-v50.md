# HGN Website Build v50 Public Beta Polish

Overlay these files into your HGN project root.

## Run

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

Then copy/paste the SQL in `supabase/v50-upgrade.sql` into Supabase SQL Editor.

## Focus
- Public beta polish
- Events/Notices/Obituaries pages that do not dead-end
- Support/About/Contact pages
- Safer SQL that creates/patches missing tables
- Daily-use panel component for homepage placement
