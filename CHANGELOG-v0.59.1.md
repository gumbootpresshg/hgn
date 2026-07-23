# HGN v0.59.1 - Operations Routes Removed

## Public project cleanup
- Removed the former public-admin route folders for print circulation, mailing labels, distribution, advertiser/customer CRM, sales, billing, accounting, financial reports, revenue readiness and private integrations.
- Removed the public Square synchronization API routes.
- Removed all redirect handoff pages. These old URLs are no longer routes in the public application and will return the normal Next.js not-found response.
- Removed links to those deleted routes from Settings, Submission Desk, Membership Desk and AI Desk.
- Limited AI Desk workflow types and connection auditing to editorial/public-site work.

## Retained
- Newsletter audience records at `/admin/subscribers`.
- Public advertising creative and placement management.
- Editorial publishing, public submissions, community, marketplace, Guide, Guide Keeper, Theme Studio, reader accounts and public APIs.
- Public-to-Operations webhook notifications for new public submissions.

## Database
- No destructive migration is included. Historical database tables remain untouched.
