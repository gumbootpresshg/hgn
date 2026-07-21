# HGN v0.50.10

## Front-page media upload authorization header fix

- Sends both the required `apikey` and `Authorization` headers to Supabase Storage and PostgREST.
- Supports current `sb_secret_...` server keys and legacy service-role JWT keys through the same direct HTTP upload path.
- Keeps live signed-in HGN administrator/publisher verification before any protected media operation.
- No database migration is required.
