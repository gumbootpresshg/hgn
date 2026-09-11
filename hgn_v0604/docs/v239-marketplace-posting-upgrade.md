# HGN v239 — Marketplace Posting Upgrade

## Added

- Category dropdown when posting a listing.
- Community / town dropdown.
- Photo upload using Supabase Storage bucket:
  - `marketplace-photos`
- Photo preview before submit.
- Price field has `$` prefix.
- Listing price displays as proper CAD currency.
- Verified Plus users auto-publish:
  - `status = active`
- Non-verified users still submit for review:
  - `status = pending`

## Permissions

Jobs:
- requires `member_permissions.can_post_jobs = true`
- or `verified_plus = true`

Real estate/rentals:
- requires `member_permissions.can_post_real_estate = true`
- or `verified_plus = true`

## SQL to run

`supabase/v239-marketplace-posting-upgrade.sql`
