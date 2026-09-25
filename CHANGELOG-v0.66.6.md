# HGN v0.66.6 — Direct Event Manager

## Added

- Admin → Events is now a direct newsroom calendar manager.
- Create staff events as drafts or publish them immediately.
- Edit, archive, delete, or duplicate an event as a new draft.
- Event fields include date range, all-day status, times, community, category, venue, organizer contact, website, description, and image.
- Staff can upload event images directly from the browser using a signed upload; no image URL is required.
- An unfinished new event draft is retained in the browser while staff work.
- Community submissions now appear in a distinct review queue and continue to use the existing review and approval route.

## Safety and delivery

- Direct event APIs require the existing HGN publisher/editor role check.
- Public calendar pages continue to show only published/approved events.
- Newsletter manual and automatic builders now query published events only, preventing staff drafts from appearing in email.
- No Supabase migration is required. This release uses the existing `events` fields and `hgn-media` storage already used by HGN event submission.
