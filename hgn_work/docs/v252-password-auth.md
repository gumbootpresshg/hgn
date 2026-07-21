# HGN v252 — Email/Password Auth

## Added

- `/signup`
  - name
  - email
  - account type
  - password
  - confirm password
- `/login`
  - email
  - password
- `/forgot-password`
- `/reset-password`

## Changed

- Login uses `supabase.auth.signInWithPassword`.
- Signup uses `supabase.auth.signUp`.
- After signup/login, users go to `/account`.
- New users get a row in `hgn_profiles`.

## Supabase dashboard settings

Go to:

Authentication → Providers → Email

Enable:
- Email provider
- Confirm email, recommended

Password login must be enabled in Supabase email settings.

## SQL

No new SQL required if v250/v251 SQL has been run.
