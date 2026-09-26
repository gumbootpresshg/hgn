# HGN v0.66.9 — Island Lens and Election Guide

## Island Lens

- Rebuilds Island Lens as a proper public home for HGN print-style photo spreads, event galleries and community photo features.
- Adds dedicated, shareable photo-feature pages at `/island-lens/[slug]`.
- Adds staff uploading through direct signed Supabase uploads, per-photo captions, credits, accessibility descriptions, reliable Move Up/Move Down ordering, drafts, publication, archiving and featured placement.
- Adds optional event date and Digital Paper issue link so online features can point readers back to the print edition.
- Restricts Island Lens editorial management to publisher-authorized accounts while preserving public published-gallery reads.

## Election Guide

- Adds `/election`, a mobile-friendly 2026 Haida Gwaii local-election guide.
- Clearly separates races on the ballot from acclamations, lists the candidate fields in HGN’s Sept. 24 roundup, and links readers to the responsible municipal and School District election pages for voting-place updates.
- Adds **Island Lens** and **Election Guide** to Community navigation, including existing saved navigation configurations without overwriting publisher changes.

## Database

- Adds `supabase/v299-island-lens-photo-features.sql`.
- The migration is additive. It preserves all current Island Lens records, does not touch reader photo submissions, and contains no Operations, advertising CRM, billing or private reader data.
