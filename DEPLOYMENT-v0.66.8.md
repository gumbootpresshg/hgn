# Deploy HGN v0.66.8

## Run this first in Public HGN Supabase

Run this exact migration:

`supabase/v298-front-page-youtube-feature.sql`

Do not run it in HGN Operations.

Then overlay the release onto `C:\HGN\HGNSite`, preserving `.git` and `.env.local`, and run:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## Use for the election forum

In **Admin → Front Page → Broadcast feature**, paste the exact public YouTube Live or watch URL, enter the headline and optional description, turn on **Show this video on the front page**, then save. Do not use a channel URL. After the forum, turn the feature off and save; the regular front-page photo returns.
