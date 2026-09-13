# HGN v0.64.0 — AI Newsroom Simplification & Automatic Local Discovery

## AI Desk
- Reworked the AI Desk around three newsroom jobs: Story Leads, Events Found, and Things to Check.
- Moved technical filters behind a More filters control.
- Renamed source-verification language to plain newsroom language.
- Kept all promotion actions human-controlled. Nothing publishes automatically.

## Event Finder
- Replaced the source-admin-first workflow with a single Find events now action.
- Added publisher Coverage Settings for publication area, communities, event types, organizations/venues, special watch terms, exclusions, and look-ahead period.
- Prefilled HGN coverage with Haida Gwaii communities and common local organizations.
- Event Finder now automatically generates location-aware search queries.
- Searches both known sources and the wider web.
- Newly discovered pages are scanned immediately, so editors do not need to approve a source before possible events can be found.
- Useful discovered sources are automatically remembered and monitored.
- One-off pages can produce event research without becoming permanent trusted sources.
- Source quality and failures are tracked automatically.
- Auto-managed sources that repeatedly fail are disabled automatically.
- Advanced Source Health remains available but is collapsed by default.

## Automatic discovery
- Daily Vercel cron now runs the full event discovery workflow, not source discovery only.
- Cron searches the configured coverage area, scans useful known sources, scans newly discovered pages, deduplicates results, and adds possible events to AI Desk research.
- Manual Find events now uses the same automatic workflow with a broader search pass.

## Safety
- AI findings remain research only.
- Findings do not enter reader Submissions.
- Event drafts require staff source verification before promotion.
- No public publishing occurs automatically.

## Database
- Added `hgn_ai_discovery_settings` singleton settings table.
- Added source-health fields to `hgn_event_sources`.
- Migration is additive and non-destructive.
