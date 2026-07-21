# HGN v241 — Membership + Custom Newspaper

## Fixed

- Column menu/name corrected again:
  - Life on the Gwaii
- Marketplace wording:
  - Notices instead of Community Notices

## Added

### HGN Members

Front page now has a visible member/sign-in box.

Free HGN Members:
- post on classifieds
- manage listings
- opt into newsletter

Paid HGN Members:
- create their own newspaper
- choose columns
- choose news sections
- choose classified categories
- choose weather location
- save preferences for download/print generation

### New pages

- `/membership`
- `/account/newspaper`

### New component

- `MemberStatusBox`

## SQL to run

`supabase/v241-membership-newspaper.sql`

## Next step later

Add PDF/download generation for the custom member newspaper.
