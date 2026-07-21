# v145 Submission Shield

This upgrade hardens the Letters to the Editor alert path after the v144 partial migration issue.

## What it does

- Repairs missing or null `alert_key` values in `submission_alert_settings`.
- Adds a small submission security checklist.
- Adds alert delivery test tracking.
- Keeps the workflow focused on the two-person admin/editor beta.

## Important beta rule

Public users should be able to submit letters, but they should not be able to read submitted letters or alert logs.

## Test after running SQL

1. Submit one test Letter to the Editor.
2. Confirm it lands in the protected admin/editor workflow.
3. Confirm the email alert is received.
4. Confirm the public cannot view submitted letter records.
