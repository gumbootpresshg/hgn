# HGN v195 — Rotating House Ads

This adds example HGN “Advertise With Us” banners into the actual rotating ad system.

## What changed

- House ads are inserted into `ads`
- They use the same placements as paid ads
- They can rotate with paid ads
- They can be paused/drafted/activated in `/admin/ads`
- They link to `/advertise`
- They are marked with `is_house_ad = true`

## Placements seeded

- `site_top`
- `home_middle`
- `article_top`
- `article_bottom`
- `classifieds_top`
- `real_estate_top`
- `events_top`

## SQL to run

`supabase/v195-rotating-house-ads.sql`

## How to use

1. Run SQL.
2. Open `/admin/ads`.
3. You should see “Advertise With Haida Gwaii News” house ads.
4. Keep them active where you want empty inventory to promote ad sales.
5. Pause/draft them where paid ads should always take priority.
