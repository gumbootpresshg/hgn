# HGN v0.62.0 — AI Desk Reset & Research Workflow

## Summary

This release refocuses AI Desk as a human-controlled research queue instead of a catch-all admin system. AI-generated event findings are explicitly separated from reader submissions, Event Finder noise is reduced, source quality can be managed, and promotion into article/event drafts now requires human verification.

## AI Desk

- Reframed AI Desk as **AI Research** for `news_lead` and `event` items.
- Legacy Guide/site-check items are no longer mixed into the normal AI Research view; Guide Keeper and Site Health remain their proper workspaces.
- Added origin badges such as **AI Event Finder** and **Manual**.
- Added a 65%+ confidence filter enabled by default.
- Added bulk Archive and Reject controls.
- Added one-click rejection of low-confidence pending findings.
- Added Archived status while preserving historical activity.
- AI item comments/activity are loaded only for the selected record instead of loading thousands of rows up front.
- Main queue is limited to the most recent 150 relevant research items.
- Article/event promotion is disabled until the source is marked **Verified**.
- Event research shows the exact source excerpt that triggered the candidate plus missing details.

## Event Finder

- Reduced default source cap from potentially 40 fragments per source to 8 candidates, configurable from 3–12.
- Added source quality scores.
- Added enable/disable controls for noisy sources.
- Added scan statistics per source.
- Removed common navigation/footer text before scanning.
- Added event-keyword, time, location and source-quality signals to confidence scoring.
- Rejects weak/noisy fragments before they ever reach AI Research.
- Added fuzzy same-date duplicate detection instead of relying only on exact normalized titles.
- Stores source excerpts and missing fields with each candidate for human review.
- Uses America/Vancouver for default Event Finder date inputs.

## Public Submissions separation

- AI Event Finder findings stay in AI Desk.
- A verified candidate can be deliberately **Promoted to Event Draft** by staff.
- Promoted AI event drafts are marked as staff research and filtered out of the public Submissions desk, so AI research is not presented as a reader submission.

## Database

Run `supabase/v283-ai-desk-reset.sql` in the PUBLIC HGN Supabase project.

The migration is additive and does not delete existing AI Desk items or event sources.
