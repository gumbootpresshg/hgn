# HGN v227 — Marketplace Login + Listing Ownership

## Added

- Login required to post Marketplace listings.
- `/marketplace/post` login gate.
- `/marketplace/my-listings` user dashboard.
- `/login` magic-link login page.
- Submit classified page now checks Supabase Auth.
- Listings save:
  - `user_id`
  - `owner_email`
  - `status = pending`

## SQL to run

`supabase/v227-marketplace-login-ownership.sql`
