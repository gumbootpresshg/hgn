# HGN v0.60.1 - Contact Form Reliability

## Fixed
- Replaced the `/contact` page's `mailto:` form with a normal browser form that POSTs to `/api/contact`.
- Contact messages now save to the existing public `submission_inbox` as `contact_message` records.
- Added server-side validation, length limits, email validation, and a hidden honeypot field for basic bot filtering.
- Added clear sending, success, and failure states on the public contact page.
- Contact submissions notify HGN Operations only after the public database record has been saved.
- Operations notification failures do not cause a saved public contact submission to fail for the visitor.
- Corrected the Operations webhook authentication header to `x-hgn-operations-secret` so it matches the private Operations receiver.
- Added summary and received time support to the shared Operations notification helper.

## Data / migrations
- No Supabase migration is required. The fix reuses the existing `submission_inbox` table and public admin review page.

## Public admin
- Contact messages appear in `/admin/submissions` under Reader submissions.

## Validation
- `npm run typecheck` was attempted in the build environment, but dependency installation could not complete due package-registry/network timeout. The partial install was missing TypeScript definition packages, so this release is labelled LOCAL-VALIDATION.
