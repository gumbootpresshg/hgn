# HGN v236 — Poll Form Reset Fix

## Fixed

Runtime error when creating a poll:

`Cannot read properties of null (reading 'reset')`

## What changed

- Saves the form element before async Supabase calls.
- Calls `formElement.reset()` safely after the poll and options are created.
- Adds basic validation:
  - question required
  - at least two options required
- Adds a disabled/saving state to prevent double-submits.

## SQL

No SQL required if v232 SQL was already run.
