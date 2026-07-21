# HGN v0.51.7 — One-Click SEO and Google News

- Adds a **Generate all SEO** button to the article editor.
- Generates SEO title, meta description, Google News headline, social title, social description, slug suggestion, keywords and image alt text.
- Adds a live article-readiness score and clear missing-field checks.
- Keeps the article body untouched. Generated fields remain editable before publishing.
- Uses social fields for Open Graph and X/Twitter previews.
- Uses Google News headline and keywords in NewsArticle structured data.
- Keeps the dedicated Google News sitemap limited to recent published stories and respects the per-story include switch.
- Adds migration `supabase/v270-one-click-seo-google-news.sql`.
