# HGN v161 — Beta Bugfix + Submissions Repair

This package fixes the first real beta issues found during local testing.

## Fixed / addressed

- Letters to the Editor RLS insert failure
- Notices RLS insert failure
- Event form reset crash
- Obituary form reset crash
- Added central admin submissions review page
- Added marketplace/classified review table
- Added job submission table/API foundation
- Simplified admin home toward publisher/editor work instead of beta clutter
- Updated About page copy
- Added safer public submission API routes

## New admin page

Open:

`/admin/submissions`

This is where submitted tips, Letters to the Editor, notices, classifieds, marketplace posts, and jobs should be reviewed.

## SQL to run

Run:

`supabase/v161-beta-bugfix-submissions.sql`

## Still needs future focused passes

- Games are paused as "coming soon"
- Realty needs a dedicated listing layout, not a generic marketplace card
- Job board now has backend foundation, but public UX still needs a full pass
- Photo upload requires Supabase Storage bucket setup
