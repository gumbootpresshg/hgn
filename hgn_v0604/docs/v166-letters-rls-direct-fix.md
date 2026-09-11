# HGN v166 — Letters RLS Direct Fix

This fixes the repeated Supabase error:

`new row violates row-level security policy for table "letters_to_editor"`

## What changed

- Repairs/creates `letters_to_editor`
- Repairs/creates `submission_inbox`
- Drops old partial/conflicting letter policies
- Adds a clean public insert policy for letters
- Adds authenticated review policy
- Updates `/api/submit/letter`
- Adds a safe `/submit-letter` page that submits through the API first

## SQL to run

`supabase/v166-letters-rls-direct-fix.sql`

## Test

1. Run SQL.
2. Restart dev server.
3. Open `/submit-letter`.
4. Submit a test letter.
5. Open `/admin/submissions`.
6. It should show under Reader submissions.

## Note

Files still containing direct letters insert before this patch:
- `src/app/letters/page.tsx`
