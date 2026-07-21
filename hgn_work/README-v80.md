# HGN v80 - Membership Desk

This upgrade adds founding supporter and membership beta readiness tools.

## New routes

- `/admin/membership-desk` - admin operating desk for member plans, supporter prospects, benefits, and launch tasks
- `/membership-beta` - public-facing membership beta explainer

## New SQL

Run this migration in Supabase:

- `supabase/v80-upgrade.sql`

## New tables

- `member_plans`
- `member_prospects`
- `member_benefits`
- `membership_tasks`

## Notes

This is designed as a beta readiness layer, not a full payment system. Use it to decide the founding supporter offer, track interested readers, and confirm the payment path before opening memberships publicly.
