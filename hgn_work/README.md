# HGN v64 Island Network Verified

This upgrade focuses on beta hardening and community-network polish without requiring risky table drops.

## Install
1. Unzip into your HGN project.
2. Run `hgnreset` from `C:\HGN\HGNSite`.
3. Run the SQL in `supabase/v64-upgrade.sql` in Supabase SQL Editor.

## Focus
- safer schema hardening for community/event/notices/social/media tables
- launch checklist and beta feedback tracking
- homepage daily utility support data
- Google News/social metadata support columns
- ad/support/community platform cleanup

## v66 Beta Operations Desk

New upgrade files included:

- `supabase/v66-upgrade.sql`
- `README-v66-BETA-OPS.md`
- `/admin/beta-ops`
- `/beta-status`

Use v66 after v65 to track launch incidents, release notes, site checks and public beta status.


## v67 Editorial Preflight Upgrade

New route:
- `/admin/preflight` — final publishing QA desk for beta stories.

New SQL:
- `supabase/v67-upgrade.sql`

What it adds:
- editorial preflight checklist templates
- per-article preflight checks
- publish notes/blockers
- beta publishing runs
- automatic article metadata checks for slug, image, credit, alt text and SEO fields

Recommended order after unzipping:

```bash
npm install
node hgnreset.js
npm run dev
```

Then run `supabase/v67-upgrade.sql` in the Supabase SQL editor.

## v69 Beta Tester Intake + Onboarding

New beta-focused upgrade files:

- `supabase/v69-upgrade.sql`
- `/admin/beta-testers`
- `/beta-join`
- `src/lib/beta-testers.ts`

### What v69 adds

- Closed beta tester intake form
- Admin tester pipeline
- Invite batch tracking
- Beta onboarding task checklist
- Tester readiness score
- Status transitions for new, invited, active, paused and complete testers

### Recommended upgrade order

```bash
npm install
node hgnreset.js
```

Then run this in Supabase SQL Editor:

```sql
-- supabase/v69-upgrade.sql
```

Restart the app:

```bash
npm run dev
```


## v72 - Revenue Readiness

New beta revenue tools:

- `/admin/revenue-readiness` - advertiser prospects, beta ad packages, revenue blockers and sponsor launch tasks.
- `/media-kit-beta` - public-facing beta sponsor/media kit page.
- `supabase/v72-upgrade.sql` - additive SQL for ad packages, advertiser prospects, sponsor assets and revenue readiness tasks.

Recommended after updating:

1. Run `supabase/v72-upgrade.sql` in Supabase SQL Editor.
2. Restart the dev server.
3. Open `/admin/revenue-readiness` and confirm the starter sponsor packages are visible.

## v73 Audience Growth Desk

New beta-growth upgrade files:

- `supabase/v73-upgrade.sql`
- `/admin/audience-growth`
- `/audience-lab`

Run `supabase/v73-upgrade.sql` after v72 to add audience campaign, channel, growth task and experiment tracking.


## v76 Newsletter Dispatch Desk

New migration: `supabase/v76-upgrade.sql`

Adds beta newsletter operations:

- `/admin/newsletter-desk` for editions, audience segments and dispatch checklist
- `/newsletter-archive` for public sent/published newsletter editions
- `newsletter_editions`
- `newsletter_segments`
- `newsletter_dispatch_tasks`
- `newsletter_metrics_snapshots`

Run the v76 SQL in Supabase after applying earlier migrations.

## v83 Archive Intelligence

New migration: `supabase/v83-upgrade.sql`

Adds:
- `/admin/archive-intelligence`
- `/archive-explorer`
- archive topic index
- article archive tagging groundwork
- evergreen resurfacing queue
- archive search QA checks
- archive health scoring

Run the migration in Supabase after applying previous upgrades.
