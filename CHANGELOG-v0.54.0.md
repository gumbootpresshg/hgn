# HGN v0.54.0 — Role Workspaces and App Runway

## Admin organization
- Replaced the small universal admin bar with a searchable slide-out workspace menu.
- Added role-aware Publisher, Editor and Sales workspaces using the existing HGN profile role fields.
- Rebuilt the Admin home around frequent tasks and clearly grouped core tools.
- Added a central admin tool registry so important destinations are connected consistently instead of being repeated by hand across menus.

## Platform audit
- Added `/admin/platform-map` as the authoritative map of connected core tools.
- Experimental and legacy routes remain available in the project but no longer crowd the primary workflow.
- Added clear links to Reports & Exports, Guide Keeper, newsletter production, integrations and public guide views.

## Mobile app runway
- Added `/admin/app-readiness` with the first iOS and Android foundation checklist.
- Identified the Guide, push notifications, offline behaviour and store-release work as explicit readiness tracks.
- Marked core tools that will feed the future mobile apps.

## Settings cleanup
- Replaced the mostly empty Settings page with direct access to newsletter, Guide, integrations, reports, app readiness and platform audit controls.

## Database
- No Supabase migration is required.
