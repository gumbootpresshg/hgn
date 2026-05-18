# HGN v205 — Sticky Menu + Dropdown Fix

## Fixed

- Sticky menu should now actually stick while scrolling.
- Dropdowns no longer open inside the horizontal scrolling menu area.
- Dropdowns now appear over the page content with high z-index.
- Kept the current newspaper header look and menu structure.

## Notes

The sticky behavior is now applied to a wrapper `div` around the nav bar, not the nav element itself. Dropdown menus are positioned outside the scroll area on desktop/mobile to avoid being clipped.
