# Deploy HGN v0.66.2

This release is an overlay onto the existing `C:\HGN\HGNSite` checkout. Preserve `.git` and `.env.local`.

No new Supabase SQL is required for this release. If v0.66.0 / v0.66.1 has not yet been deployed, run the corrected `supabase/v292-newsletter-subscriber-reliability.sql` and then `supabase/v293-newsletter-editorial-control.sql` in the **Public HGN Supabase** project before using those related newsletter features.
