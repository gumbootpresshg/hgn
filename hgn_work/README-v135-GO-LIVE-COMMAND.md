# HGN v135 - Go-Live Command

This is a launch-discipline upgrade for the first online soft beta upload.

## New routes

- `/admin/go-live-command`
- `/go-live-status`

## New SQL

Run after previous migrations:

- `supabase/v135-upgrade.sql`

## What this does

v135 helps the two-person admin/editor workflow finish the upload checklist before going online:

- production build check
- migration order check
- production environment check
- homepage and article smoke tests
- one real story published end to end
- mobile-first homepage pass
- rollback notes

After this package, avoid adding new workflow surfaces until the site has been uploaded and tested online.
