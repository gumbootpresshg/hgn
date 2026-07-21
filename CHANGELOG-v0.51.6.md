# HGN v0.51.6

## Mobile navigation
- Rebuilt the mobile menu as a true full-screen drawer.
- Locks both the document and page while the menu is open.
- Keeps one touch-scroll area inside the menu.
- Moves the HGN, search and close controls into the drawer header so the bar no longer floats through the page.
- Adds overscroll containment and safe-area bottom spacing.

## Archives
- Renamed the public ePaper link to Archives.
- Renamed the Digital Paper page heading to Archives while keeping the existing `/digital-paper` route and published-edition data.

## Full Square history
- Added a month-by-month historical backfill to Admin > Integrations.
- Pulls paginated Square payments, invoices, orders and customer profiles.
- Stores Square IDs with upsert protection so re-running the same period is safe.
- Shows live month progress and totals.
- Added `supabase/v269-square-history-sales-agents.sql`.

## Sales and AI Desk
- Added a sales worklist for follow-ups due.
- Added active opportunity and pipeline-value summaries.
- Added human-reviewed AI follow-up and renewal draft actions.
- Nothing is sent automatically.
