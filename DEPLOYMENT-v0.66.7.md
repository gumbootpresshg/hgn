# Deploy HGN v0.66.7

## Run this first in Public HGN Supabase

Run this exact migration:

`supabase/v297-support-page-reader-contributions.sql`

This changes the editable Support page content only. Do not run it in HGN Operations.

Then overlay the release onto `C:\HGN\HGNSite`, preserving `.git` and `.env.local`, and run:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```
