# HGN v187 — Classifieds + Real Estate Admin

Adds:

- `/admin/classifieds`
- `/admin/classifieds/[id]`
- `/admin/classifieds/settings`
- `/real-estate`

Classifieds admin now supports approve, pending, reject, delete, edit, towns, categories, and real-estate fields.

Real estate is separated from marketplace and supports Home Sale, Rental, Wanted Rental, map URL, beds, baths, square feet.

On the Record is hidden from Opinion for now.

SQL to run:

`supabase/v187-classifieds-real-estate-admin.sql`
