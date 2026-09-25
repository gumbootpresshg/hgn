# Deploy HGN v0.66.4

## Run this first in Public HGN Supabase

Run `supabase/v295-newsletter-signup-simplification.sql`.

It is additive/idempotent in practice: it creates the signup-page default only when absent and updates only legacy default copy. It does not delete subscribers, newsletter products, Guide preferences or newsletter history.

Do not run this in HGN Operations.

Then overlay this release onto `C:\HGN\HGNSite`, preserving `.git` and `.env.local`, install dependencies and run the validation commands.
