# HGN v0.67.44 — caching and front-page corrections

- Removed the nonce-per-request CSP path that forced all public routes to render dynamically.
- Restored a static CSP suitable for CDN/ISR caching and allowed inline styles required by Next.js image layout.
- Removed `force-dynamic` from public article and author pages.
- Prevented the homepage from pairing a lead headline with an unrelated legacy front-page-photo article.
- Classified Staff Report, Submitted and Haida Gwaii News/HGN as Organizations in credited article structured data.

