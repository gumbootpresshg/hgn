# HGN v186 — On the Record Strict Cleanup

This fixes Editorials appearing under the On the Record menu item.

## Fixed

- On the Record route now requires a real On the Record signal:
  - category = `On the Record`
  - title contains `On the Record`
  - slug contains `on-the-record`
- On the Record route excludes:
  - category/title/slug containing `Editorial`
- Main `/opinion` page now links cleanly to:
  - `/opinion/editorials`
  - `/letters`
  - `/opinion/on-the-record`

## SQL to run

`supabase/v186-on-the-record-strict.sql`

## Routes patched/found

- `src/app/opinion/on-the-record/page.tsx`
