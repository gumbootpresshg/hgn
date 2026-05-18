# HGN v143 - Security + Submission Alerts

This upgrade adds a safer Letters to the Editor submission path and a practical security desk for the two-person admin/editor beta.

## New routes

- `/admin/security-alerts` - security checklist, alert settings, recent letters, alert logs
- `/security-alerts-status` - public/internal status explainer
- `/api/submit-letter` - server-side submission endpoint with basic spam/rate-limit protections
- `/submit-letter` - updated to use the secure API route instead of writing directly from the browser

## Environment variables for email alerts

Recommended for beta:

```env
RESEND_API_KEY=your_resend_key
HGN_ALERT_EMAIL_TO=you@example.com
HGN_ALERT_EMAIL_FROM="HGN Alerts <alerts@yourdomain.com>"
HGN_ALERT_SECRET=random-long-string
```

Optional phone notification using an email-to-SMS address:

```env
HGN_ALERT_SMS_EMAIL=your-number@carrier-sms-gateway.example
```

Phone/SMS should be treated as optional until email alerts are working reliably.

## Security notes

- Public users can submit letters.
- Authenticated admin/editor users can review letters.
- The service role key must remain server-only.
- The form includes a honeypot and basic in-memory rate limiting.
- RLS helper policies are included, but should be reviewed against your exact Supabase Auth role setup before public launch.

## SQL

Run:

```sql
hgn_v143/supabase/v143-upgrade.sql
```

The migration is defensive and safe to rerun after a partial attempt.
