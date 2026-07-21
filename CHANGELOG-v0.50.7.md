# HGN v0.50.7

## Front-page media authentication fix

- Replaced the upload route's supabase-js user verification with a direct request to Supabase Auth.
- Prevents valid sessions from failing with `Invalid Compact JWS` when newer project keys are used.
- Keeps all publisher/admin permission checks server-side through the service-role client.
- Adds clear responses for unavailable auth service and genuinely expired sessions.
- No Supabase migration is required.
