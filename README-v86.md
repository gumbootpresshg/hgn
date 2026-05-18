# HGN v86 - Training Desk

Adds a beta training and onboarding layer for contributors, admins and launch helpers.

## New routes

- `/admin/training-desk` - internal training command centre
- `/training-beta` - public-facing beta training/resource page

## New SQL

Run this after v85:

```sql
supabase/v86-upgrade.sql
```

## New tables

- `training_modules`
- `staff_onboarding_runs`
- `training_resources`
- `beta_training_tasks`

## Why this matters for beta

HGN now has lots of admin desks. v86 helps make the system teachable: contributors can be onboarded, admins can track training tasks, and public beta helpers can find basic guidance.
