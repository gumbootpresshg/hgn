# HGN v240 — Listing, Poll, Menu Fixes

## Fixed

- Column name corrected:
  - Life on the Gwaii
- Manage My Listings build error fixed:
  - `"use client"` is now first line.
- Posting a listing now includes `contact_name` to satisfy the database not-null constraint.
- Marketplace dropdown includes:
  - Post Ad
  - My Listings
  - Sign In / Sign Up
- Poll widget moved out of the bottom of the front page and placed after Upcoming Events/right-rail area.
- Article list cards now show a photo on the left only if the article has one.
- No blank photo square if no photo exists.

## SQL to run

`supabase/v240-listing-poll-menu-fixes.sql`
