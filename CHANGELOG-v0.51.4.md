# HGN v0.51.4

## Historical revenue and payment imports
- Added a unified historical transaction ledger for Square, PayPal and Patreon CSV exports.
- Added provider-aware CSV mapping, preview totals and duplicate-safe upserts.
- Keeps Patreon support revenue separate from advertising invoices until manually reconciled.

## Square connection foundation
- Added a protected Integrations page and manual Square synchronization.
- Square sync imports the most recent 90 days of payments and updates connection status.
- Requires `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID` in the server environment.
- Optional sandbox testing through `SQUARE_ENVIRONMENT=sandbox`.

## Database
- Added `supabase/v268-external-payments-integrations.sql`.
