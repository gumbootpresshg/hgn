# HGN v242 — Unified Accounts + Business/Organization Foundation

## Core rule

Everything uses one HGN account/login system. No separate systems for marketplace, newsletters, subscriptions, business directory, comments, events or Island Lens.

## Launch account types

- Free Individual
- Paid Individual Member
- Business / Organization

## Added database foundation

Run:

`supabase/v242-unified-accounts-business.sql`

Adds:
- `hgn_profiles`
- `business_profiles`

Adds user ownership fields across:
- classifieds
- events
- event submissions
- Island Lens
- newsletter drafts

## Business accounts

Business/Organization accounts now have:
- Business profile
- Business directory listing foundation
- Marketplace/classified ownership
- Event/job posting foundation
- Billing/subscription fields

## New pages

- `/account`
- `/account/profile`
- `/account/business`
- `/account/newsletters`
- `/account/saved`
- `/account/events`
- `/account/island-lens`
- `/account/billing`
- `/business-directory`

## Admin structure

Admin dashboard now includes:
- Articles
- Pages
- Marketplace
- Members
- Subscriptions
- Business Directory
- Newsletters
- Events
- Obituaries
- Island Lens
- Polls
- Settings

## Header/Footer

- About Us and Contact Us should live in the footer only.
- Header now includes My HGN and Business Directory.
