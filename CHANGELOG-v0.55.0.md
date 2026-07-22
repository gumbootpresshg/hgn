# HGN v0.55.0 - Theme Studio and shared app design system

## Added
- Publisher-only Theme Studio at `/admin/theme-studio`.
- Four tested presets: Island Newspaper, Coastal Modern, Weekend Edition and High Contrast.
- Safe controls for colours, headline style, body style, spacing and masthead size.
- Editable public labels for the site name, tagline, primary navigation, Guide, events, support and subscription wording.
- Live in-admin preview before publishing.
- Draft save, publish, reset and published-version history.
- Public `/api/site-config` endpoint for the website and future iOS/Android apps.
- Shared runtime theme provider so website chrome follows the published theme.
- Header and footer labels now come from the shared configuration.

## Database
Run `supabase/v275-theme-studio.sql` after v274.

## Safety
- Existing Island Newspaper design remains the default.
- URLs, article content and stored editorial records are not changed.
- Theme publishing is restricted to publisher/admin roles.
