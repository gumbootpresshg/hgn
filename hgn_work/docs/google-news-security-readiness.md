# HGN Google News and Security Readiness

## Google News / SEO status

Implemented or prepared in recent update packs:
- NewsArticle structured data on article pages.
- Improved article metadata fields for title, description, image, author, published date, and updated date.
- Public `/news-sitemap.xml` route for recent published articles.
- Public `/sitemap.xml` route updates.
- Visible article byline and publish/update dates.
- Cleaner section/subcategory routes such as `/opinion/on-the-record`.

Must verify after deployment:
- `/news-sitemap.xml` opens publicly and only lists recent published articles.
- `/sitemap.xml` opens publicly.
- A live article page contains valid `NewsArticle` JSON-LD.
- Every article has a stable slug, visible author, visible publish date, and useful excerpt/meta description.
- Google Search Console has the domain verified and both sitemaps submitted.
- Google Publisher Center profile is created/updated for Haida Gwaii News.

Recommended next improvements:
- Add an editorial staff/about page linked from the footer.
- Add author profile pages for regular contributors.
- Keep article URLs permanent; do not change slugs after publishing unless redirects are added.
- Add 1200px-wide social/OG images for major stories.
- Keep syndicated/press-release content clearly labelled.

## Security status

Minimum checks before wider launch:
- Admin routes require login and role/permission checks.
- Supabase Row Level Security is enabled on public-write tables.
- Public forms use validation and rate limiting/CAPTCHA where practical.
- Storage upload buckets restrict file types and file sizes.
- No service-role key or private secrets are exposed in client-side code.
- Public tables only expose data intended for public display.
- Admin delete/publish/update actions are protected by RLS or server-side checks.

Recommended next improvements:
- Move sensitive admin writes behind server actions/API routes.
- Add audit logs for admin publish/delete actions.
- Add spam protection for marketplace, events, letters, and contact forms.
- Periodically review Supabase policies before launch.
