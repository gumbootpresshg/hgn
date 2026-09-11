# HGN v193 — Ad Upload + Rotation + Size Guide

## Added

- Upload ad images from `/admin/ads/[id]`
- Supabase Storage bucket: `hgn-ads`
- Rotation weight per ad
- Rotating `AdSlot` component
- Placement size guidance:
  - desktop width/height
  - mobile width/height
  - file size notes
- Placement page now shows recommended sizes

## Recommended default sizes

- Top/site banner: 1200 × 250 px
- Article/classified/real estate/event banner: 970 × 250 px
- Sidebar: 300 × 250 px
- Mobile: 640 × 180 px

## SQL to run

`supabase/v193-ad-upload-rotation.sql`
