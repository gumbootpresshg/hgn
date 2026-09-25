# HGN v0.66.4 — Newsletter Signup & Reader Support

## Reader-first newsletter signup

- Simplified `/newsletter` to ask only for name and email when the HGN Update is the one eligible newsletter.
- When only one eligible newsletter is active, readers are subscribed to it automatically; no newsletter-choice control is shown.
- Paused newsletter products, including Haida Gwaii Guide, remain hidden from public signup while existing Guide preferences are preserved.
- Added a calm post-signup invitation to visit the public Support HGN page.

## Welcome email

- Refreshed the welcome copy for the biweekly HGN Update.
- Added an optional Support HGN link. The link goes to the public CMS-managed `/support` page, so its current Patreon destination can be changed later without altering newsletter delivery code.

## Publisher controls and safety

- Clarified the Signup Page editor to reflect the simplified reader form.
- The signup API no longer writes the optional `town` field, preserving any existing subscriber town data rather than clearing it; it also preserves unavailable/paused product preferences when an existing reader signs up again.
- Newsletter sponsor inventory and the existing delivery architecture are unchanged.

## Database

- Run `supabase/v295-newsletter-signup-simplification.sql` in the **Public HGN Supabase** project.
