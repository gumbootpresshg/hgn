# HGN v0.50.1 - Guide Dropdown Hover Fix

- Anchors each desktop dropdown beneath its own navigation button instead of centring every dropdown in the viewport.
- Clamps dropdowns inside the browser width so they cannot be cut off at either edge.
- Adds a short guarded close delay so the menu stays open while the pointer travels from the navigation button into the dropdown.
- Cancels the close timer when the pointer enters the dropdown.
- Preserves route-change, outside-click, Escape-key and mobile-menu closing behaviour.
- No Supabase migration required.
