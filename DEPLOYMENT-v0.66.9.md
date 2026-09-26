# Deploy HGN v0.66.9

## Run this first in Public HGN Supabase

Run this exact migration:

`supabase/v299-island-lens-photo-features.sql`

Do not run it in HGN Operations.

Then overlay the release onto `C:\HGN\HGNSite`, preserving `.git` and `.env.local`, and run:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## First use

- Go to **Admin → Island Lens → New photo feature**.
- Upload each photo, add its caption/credit, reorder it, and publish when ready.
- The first photo becomes the cover image. Add a Digital Paper link only if the feature is also in print.
- The Election Guide is live at `/election` after deployment. Voting-place information links to the relevant local-election office because each local government sets its own voting opportunities.
