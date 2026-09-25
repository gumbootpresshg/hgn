# HGN v0.66.3 — Public Page CMS Expansion

## Publisher CMS

- Added built-in editable public pages for Support HGN, Contact, Advertising, Community Standards, Corrections, Membership and Print Subscriptions.
- Pages now display their real public routes in the CMS, such as `/support` and `/advertise`, instead of misleading `/pages/...` routes.
- Built-in page routes are protected from accidental slug changes.
- Added editable table blocks for advertising rates, issue dates and subscription information.

## Preserved functionality

- Contact and Corrections forms remain functional and are shown below their editable page content.
- Existing Support aliases redirect to the single editable `/support` page.
- No private advertiser CRM, billing, sales records, circulation or Operations data is exposed in Public HGN.

## Database

- Run `supabase/v294-public-page-cms-expansion.sql` in the **Public HGN Supabase** project before using the expanded Pages list.
