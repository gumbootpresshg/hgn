# HGN v255 — Business Profile Auth + Ownership

## Fixed

`/account/business` now requires a signed-in HGN account.

## Business users can now

- create their own business profile
- edit/update their profile
- delete their profile
- keep the profile connected to their `user_id`

## If not signed in

The page shows:
- Create Business Account
- Sign In

## SQL to run

`supabase/v255-business-profile-auth.sql`
