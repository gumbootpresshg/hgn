# HGN v206 — True Sticky Nav Fix

## Fixed

The sticky menu was still inside the masthead/header container. That can prevent sticky behavior from working after the header scrolls away.

## Changed

- Header now returns two sibling elements:
  - normal masthead header
  - separate sticky nav bar
- Sticky nav is no longer inside the masthead header.
- Removed horizontal scroll/overflow wrapper so dropdowns are not clipped.
- Dropdowns now open directly from relative menu items with high z-index.
- Small Haida Gwaii News wordmark remains beside the sticky menu.

## SQL

No SQL required.
