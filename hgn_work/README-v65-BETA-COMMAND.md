# HGN Website Build v65 — Beta Command Centre

This upgrade turns the current beta tooling into an actual operating desk for launch prep.

## Install

1. Unzip this package over `C:\HGN\HGNSite`.
2. In Supabase SQL Editor, run:

```sql
supabase/v65-upgrade.sql
```

3. Restart the app:

```powershell
cd C:\HGN\HGNSite
hgnreset
```

## New in v65

- `/admin/beta-command` — one-page beta readiness command centre.
- Readiness score based on launch checklist completion and blocking tasks.
- Blocking launch item triage with quick “mark done”.
- Beta test session tracker for mobile/editor/reader testing passes.
- Feedback triage actions directly from the command centre.
- Recent submission inbox preview.
- New Supabase tables:
  - `beta_test_sessions`
  - `beta_test_tasks`
  - `article_preflight_checks`
- Expanded `beta_feedback` triage fields.
- Expanded `launch_checklist` with `blocking`, `owner`, `priority`, and `due_at`.
- Seeded beta checklist items for publishing, mobile, submissions, Google News, admin access, ads, and newsletter.

## Why this matters

HGN already has a lot of features. v65 focuses on making the beta manageable:

- What is blocking launch?
- What needs testing?
- What feedback is still open?
- Are there enough real published stories?
- Are community submissions landing correctly?

## Recommended beta gate

Do not open public beta until:

- readiness is 80% or higher
- blockers are zero
- homepage has at least 8 real published local stories
- mobile homepage and article pages have been tested
- all public submission forms have been verified
