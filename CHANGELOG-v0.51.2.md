# HGN v0.51.2

## Billing workflow upgrade
- Added real payment records for Square, e-transfer, direct deposit, cheque, cash and other methods.
- Added partial-payment support and live remaining balances.
- Added a customer-focused "Catch up" filter.
- Added overdue filtering and clear payment history on each billing item.
- Added one-click billing follow-up preparation in the AI Desk.

## Google Sheets bridge
- Added `/admin/billing/import` for CSV exports from Stacey's existing advertising sheet.
- Imports customers, billing records, invoice status, payment status and payment history.
- Includes a preview and totals before importing.

## Operations dashboard
- Received-this-month now uses actual payment records.
- Outstanding totals account for partial payments.
- Added an overdue alert and direct Sheet Import link.

## Database
- No new migration is required beyond v267.
