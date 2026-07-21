# HGN v0.52.1 Newsletter Automation

- Added manual and automatic newsletter modes.
- Added automatic biweekly build-for-approval or build-and-send controls.
- Added preference-aware article selection for each subscriber.
- Added one-click newsletter building, preview, test send and approved live sending.
- Added HGN circular seal to newsletter emails, admin preview and preference pages.
- Added subscriber preference and unsubscribe pages.
- Added delivery history and edition recipient counts.
- Added a daily Vercel cron check. It only acts when automatic mode is enabled and the interval is due.
- Automatic sending remains off by default and approval is required by default.
- Requires `RESEND_API_KEY`, a verified sending address/domain, and migration `v272-newsletter-automation.sql`.
