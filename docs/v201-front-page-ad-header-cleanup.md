# HGN v201 — Front Page Ad + Header Cleanup

## Fixed

- Removed extra homepage banner clutter.
- Removed homepage side/top ad injections.
- Homepage now has one middle-page banner only.
- Article pages now have one bottom banner only.
- House ad fallback only appears where explicitly requested.
- Header simplified and kept closer to original style.
- Support Us / Advertise With Us sit beside About Us / Contact Us in the top utility row.

## SQL to run

`supabase/v201-front-page-ad-header-cleanup.sql`

This pauses house ads except:
- `home_middle`
- `article_bottom`
