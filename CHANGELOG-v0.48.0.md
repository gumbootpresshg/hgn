# Haida Gwaii News v0.48.0

## Theme 3: Modern Broadsheet

This release moves the public site from a rounded, card-heavy visual style to a restrained digital-newspaper design while preserving the existing HGN routes, Supabase content, admin tools and publishing workflows.

## Masthead and navigation

- Rebuilt the site masthead around a large serif Haida Gwaii News wordmark.
- Added a compact utility strip for date, newsletter, ePaper, advertising, contact and account access.
- Reworked desktop navigation into a tighter newspaper section bar.
- Reorganized navigation labels around Local, News, Arts & Life, Opinion, Community and Marketplace.
- Preserved the existing dropdown destinations and columnist links.
- Rebuilt the mobile menu as a flat, rule-separated newspaper index.
- Removed rounded menu panels and the remaining visual treatment that made navigation feel like an app dashboard.
- Preserved sticky navigation, keyboard operation and mobile body-scroll locking.

## Homepage

- Rebuilt the front page into a three-column broadsheet hierarchy.
- Added a compact latest-headlines strip beneath navigation.
- Positioned the lead headline, lead image and opinion/latest rail as one editorial package.
- Added a four-column secondary story band.
- Reworked the lower news feed into denser headline-and-thumbnail rows.
- Integrated existing upcoming events, reader poll, house advertising and support messaging into the newspaper grid.
- Removed rounded feature cards, oversized coloured panels and heavy shadows.
- Continued using the existing article, event, poll and advertisement data sources.
- Kept the homepage revalidation interval at 60 seconds.

## Shared design system

- Added reusable newspaper utility classes for mastheads, section kickers, rules, section headings and editorial buttons.
- Changed the primary palette to paper white, warm stone, charcoal, deep editorial blue and restrained dark red.
- Changed global cards, buttons, forms and legacy rounded components toward flatter print-inspired styling.
- Reduced corner rounding and removed decorative shadows site-wide.
- Updated focus states to use the new editorial accent while retaining high visibility.
- Improved article typography with Georgia-based body copy, stronger headings and editorial blockquotes.
- Updated shared section headers and article list cards to match the new visual system.

## Footer

- Replaced the dark promotional footer with a warm newsprint footer.
- Added clearer News, Community and About link groups.
- Added direct support and subscription actions.
- Preserved social, legal, privacy, corrections and accessibility links.

## Version and package integrity

- Updated the project version from 0.47.0 to 0.48.0.
- Regenerated package-lock.json using the public npm registry.
- Confirmed no private OpenAI package registry URLs remain.

## Database changes

No Supabase schema or Row Level Security changes are included in this release. No SQL migration needs to be run.

## Production verification

Completed successfully:

- `npm ci`
- `npx tsc --noEmit`
- Five full Next.js 16.2.10 Webpack production builds covering all 201 top-level route groups
- Generated route type validation
- Page-data collection
- Static page generation
- ZIP integrity verification

The route tree is large enough that a single monolithic sandbox build exceeded the execution window. To avoid weakening validation, the complete route tree was built in five isolated production groups with the shared root layout and homepage included in every group. Every group completed successfully.
