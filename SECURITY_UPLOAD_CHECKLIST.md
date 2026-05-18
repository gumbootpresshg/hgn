# HGN pre-upload security checklist

Before uploading/deploying:

1. Put real environment variables in the host dashboard only. Do not upload `.env.local` or `.env.import.local` with real keys/passwords.
2. Rotate any Supabase service role key or admin password that was ever inside a shared zip.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_`.
4. Confirm Supabase RLS policies are enabled for user-owned tables such as classifieds, profiles, submissions, notices, obituaries, and event submissions.
5. Public pages should read public tables only; admin/review tables should remain protected by RLS.
6. Test as logged-out, free user, and admin before launch.
