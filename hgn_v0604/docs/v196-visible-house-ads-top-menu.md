# HGN v196 — Visible House Ads + Top Menu

## Fixed

The house ads were in the ad database but not guaranteed to render anywhere.

## Added

- `AdSlot` now falls back to a visible HGN house ad if no paid ad loads
- Homepage renders:
  - `site_top`
  - `home_middle`
- Article pages render:
  - `article_top`
  - `article_bottom`
- Header/top menu includes:
  - Support Us
  - Advertise With Us
  - About Us
  - Contact Us
- Support page fallback added if missing

## SQL to run

`supabase/v196-visible-house-ads-top-menu.sql`
