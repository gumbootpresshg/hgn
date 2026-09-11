# HGN v0.60.2 - Contact Correspondence Desk

## Contact messages
- General contact-form messages no longer appear in the editorial Approve / Reject workflow.
- Added `/admin/contact-messages` as a dedicated correspondence inbox.
- Contact messages can be marked read/unread, assigned to the current staff user, replied to by email, archived, and restored.
- Replying uses Resend server-side and records reply state on the public submission record.
- The original visitor message remains stored in `submission_inbox`.

## Contact & notification settings
- Added `/admin/settings/contact`.
- Publisher/editor-authorized server API stores routing settings in `hgn_contact_settings`.
- Configurable destinations are available for general contact, news tips, advertising, subscriptions, public notices, obituaries, corrections, and letters.
- Public contact form can be enabled/disabled without removing the Contact page.
- Operations notification for contact messages can be enabled/disabled.
- The public Contact page displays the configured general contact email.

## Delivery behavior
- A contact message is saved to public Supabase before email or Operations notification is attempted.
- Staff email notification failure does not discard the visitor submission.
- Operations webhook failure does not discard the visitor submission.
- Staff notification email uses the visitor address as Reply-To.
- Replies from the admin correspondence desk use `RESEND_API_KEY` and the server-side `HGN_ALERT_EMAIL_FROM` sender.

## Database
Run `supabase/v279-contact-correspondence.sql` against the PUBLIC HGN Supabase project.
The migration is additive and does not delete historical data.
