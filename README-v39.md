# HGN Website Build v39 — Events + Classifieds Cleanup

Unzip over your project folder (`C:\HGN\HGNSite`) and replace files.

Then run:

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

Run `supabase/v39-upgrade.sql` in Supabase SQL Editor.

What changed:
- Events added as a major reader feature.
- Events page has Today / This Weekend / Upcoming sections.
- Event submit page for reader submissions with editor approval.
- Homepage can promote `/events` with “What’s Happening” CTA.
- Notices are moved conceptually under Classifieds, but `/notices` remains working.
- Obituaries remain their own reader destination.
- Header/menu cleaned to: News, Sports, Features, Events, Opinion, Columnists, Classifieds, Obituaries, Weather, Fun.
