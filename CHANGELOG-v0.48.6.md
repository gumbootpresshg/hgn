# HGN v0.48.6

## Homepage flow
- Rebuilt the homepage as two independent vertical systems: a broad editorial column and a separate right rail.
- Removed shared grid rows that created large blank rectangles when one card was taller than its neighbour.
- Split More Local News into two explicit independent stacks rather than CSS multi-column flow.
- Moved the advertisement into the left news stack so it follows content naturally.
- Moved opinion, latest headlines, events, poll and support into one continuous right rail.

## Supabase security
- Added `supabase/v260-rls-public-schema-lockdown.sql`.
- The migration enables RLS on every ordinary `public` table that currently lacks it.
- Newly protected tables receive authenticated editor/admin management access only.
- A narrow whitelist of public reference/content tables retains read-only visitor access.
- Existing RLS-enabled tables and policies are not changed.

## WAF scan
- No application change is required for the reported WordPress scanner burst. Vercel WAF blocked the requests and the app returned no server errors.
- The scan is documented as hostile background internet traffic, not evidence of a WordPress compromise.

## Deployment order
1. Back up the Supabase database.
2. Run `supabase/v260-rls-public-schema-lockdown.sql` in Supabase SQL Editor.
3. Confirm its final verification query returns zero rows.
4. Test admin publishing and public homepage/marketplace/events.
5. Build and deploy the application.
