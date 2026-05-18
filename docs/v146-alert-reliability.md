# HGN v146 — Alert Reliability

This upgrade stabilizes the Letters to the Editor alert settings after older table-shape issues.

## What changed

- Adds defensive schema guards for `submission_alert_settings`
- Repairs required legacy columns like `alert_key` and `alert_label`
- Adds alert delivery check records
- Adds `/admin/alert-reliability`
- Adds `/alert-reliability-status`

## Recommended order

1. Run `hgn_v146/supabase/v146-upgrade.sql`
2. Open `/admin/alert-reliability`
3. Confirm the destination email for Letters to the Editor
4. Test one real letter submission
5. Add phone/SMS only after email is confirmed
