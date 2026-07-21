# HGN v0.48.8 - Complete Excerpts and Favicon

## Reader-facing fixes
- Replaced raw character slicing with word- and sentence-aware excerpt trimming.
- Prevented homepage article summaries from ending halfway through a word.
- Added a consistent `Read more →` prompt to homepage summary cards and related-article cards.
- Increased the homepage secondary-card excerpt allowance slightly while keeping the newspaper layout compact.

## Branding
- Added the approved cream-and-black HGN serif monogram as the site favicon.
- Added 512x512 application icon and 180x180 Apple touch icon variants.
- Updated global metadata to advertise the new icon assets.

## Technical
- Added `src/lib/text.ts` as the shared safe text-cleaning and excerpt utility.
- Updated project version to 0.48.8.
- No Supabase migration is required for this release.
