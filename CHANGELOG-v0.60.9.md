# HGN v0.60.9 - Mobile Newspaper Polish + Content Freshness

## Mobile reader experience
- Compresses the mobile masthead while preserving the Haida Gwaii News identity.
- Reworks the Latest strip into a horizontally scrollable, readable headline rail instead of chopped fragments.
- Reduces the mobile top-story headline and excerpt scale and limits the homepage excerpt height.
- Tightens homepage spacing, empty Upcoming Events state, sidebar sections, and Reader Poll.
- Makes poll choices more compact and touch-friendly on phones.

## Content freshness
- Homepage and Opinion editorial feeds are now dynamically rendered so recently published content is not held behind stale route output.
- Opinion detection now includes `subcategory`, fixing articles categorized as Editorial/Opinion through that field.
- Editorial, Opinion subcategory, and On the Record pages use the shared publishing date settings.
- Upcoming Events determines today using the configured newsroom timezone rather than UTC.

## Preserved
- Desktop newspaper layout and public routes.
- Existing article, event, poll, advertising, newsletter, Guide and account data.
- No database migration is required.
