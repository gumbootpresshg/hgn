# Platform configuration foundation

This release starts the reusable Gumboot Press newspaper-platform layer.

## Branding
Continue to use `/admin/theme-studio` for publication name, tagline, colours, typography, masthead and visual style.

## Site Configuration
Use `/admin/site-configuration` for:
- top-level menus and submenu labels
- menu order and destinations
- show/hide controls
- section names and routes
- app inclusion metadata
- publication feature switches
- visibility metadata

The current visibility setting is authoritative for navigation/discovery. `disabled` and staff-only entries are removed from public navigation. Logged-in/member route enforcement still needs to be implemented per protected route before this setting should be treated as a security boundary.

## Reusable-newspaper direction
A different publication can now rename or remove HGN-specific navigation, define its own sections, and disable HGN-only modules without editing the Header source.
