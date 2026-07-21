# HGN v0.49.2 - Front-page upload session fix

- Refreshes the Supabase session before protected media uploads.
- Retries an upload once with a newly refreshed access token when the first request returns 401.
- Shows a clear sign-in message when the editor session has ended.
- Verifies upload tokens through the Supabase anon/auth client, while retaining the service-role client only for authorized storage and database writes.
- Preserves publisher/admin permission checks and existing upload restrictions.

No Supabase migration is required.
