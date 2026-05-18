# HGN v237 — Platform Carryover

## Added

- `/search`
- `/island-lens`
- `/admin/island-lens`
- `/obituaries`

## Navigation

- Search visible in header utility links.
- Island Lens added.
- Obituaries added as top-level nav.
- Opinion submenu includes On the Record.

## Database

Run:

`supabase/v237-platform-carryover.sql`

Adds:
- `island_lens_items`
- `obituaries`
- `member_permissions`
- columnist `bio` and `photo_url`

## Poll note

Homepage poll appears only when a poll exists in `/admin/polls` with:
- status: `published` or `active`
- Show on home page checked
