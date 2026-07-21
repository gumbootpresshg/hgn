# Haida Gwaii News v0.47.0

Production-hardening release prepared from the uploaded production ZIP identified by the owner as Vercel `main` commit `f64405b` ("Remove marketplace price filters and fix menu scroll boxes"). The archive did not include `.git`, so the commit identity could not be independently verified from repository metadata.

## Current-state audit

- Next.js App Router application with a large public newspaper surface, Supabase data/auth/storage, editorial administration, marketplace, events, alerts, RSS, XML sitemap, and Google News sitemap.
- The project already included article metadata, canonical URLs, Open Graph/Twitter metadata, NewsArticle JSON-LD, RSS, robots, regular sitemap, and a 48-hour Google News sitemap.
- Marketplace price filters were already removed in the uploaded source.
- The navigation still used hover/focus dropdowns with a deeply nested Opinion/Columns menu that could become awkward on small screens.
- The most serious discovered issue was `AdminGate`: it returned admin content unconditionally and `useAdminSession()` always returned authenticated.
- Article bodies were rendered with `dangerouslySetInnerHTML` without a production sanitizer in the render path.
- Media upload accepted every `image/*` MIME type, including formats that should not be accepted directly, and metadata fields had no practical length caps.
- Security headers and a sitewide CSP were not configured.
- Root metadata was minimal and did not establish a metadata base, title template, RSS alternate, Googlebot preview directives, or organization schema.
- The package used floating `latest` dependencies. The installed Next.js release was 16.2.4 and was flagged by npm security advisories.
- The source contains a very large number of legacy/admin/status routes and migration files. This increases maintenance and build cost and should be consolidated in a later controlled release rather than deleted blindly.

## Implemented

### Navigation and accessibility

- Rebuilt the site header navigation with distinct desktop and mobile interaction patterns.
- Removed nested scrolling menu behaviour. The Opinion/Columns desktop menu now opens as a wide, multi-column panel rather than a narrow scroll box.
- Added a proper mobile menu button with `aria-expanded`, `aria-controls`, labelled open/close states, and body scroll locking.
- Added keyboard-visible focus treatments throughout navigation.
- Added a skip-to-content link.
- Added reduced-motion handling and improved touch target behaviour.
- Preserved all existing primary destinations and the overall newspaper masthead design.

### Editorial and security

- Replaced the non-functional `AdminGate` stub with a real Supabase session/profile permission check.
- Admin access now requires an authenticated profile with `is_admin`, publisher tools permission, or an admin/publisher account type.
- Added clear signed-out and unauthorized states instead of exposing newsroom pages.
- Added server-side article HTML sanitization using `sanitize-html` before rendering stored article content.
- Preserved safe editorial formatting, links, images, headings, lists, blockquotes, captions, and code blocks while discarding unsafe tags/attributes.
- External links rendered from article HTML receive `noopener noreferrer`.
- Article images inside stored HTML receive lazy-loading and async decoding attributes.
- Restricted media uploads to JPEG, PNG, WebP, AVIF, HEIC, and HEIF.
- Added metadata length limits and normalized upload usage paths.
- Existing 12 MB upload limit, authenticated user check, publisher permission check, server-side Sharp conversion, and bucket allowlist remain intact.

### SEO, Google News, and structured data

- Expanded root metadata with:
  - canonical base URL
  - title template
  - application/category metadata
  - RSS alternate
  - full Open Graph defaults
  - Twitter large-image defaults
  - Googlebot large image/snippet/video preview directives
  - locale and site name
- Added sitewide `NewsMediaOrganization` JSON-LD with publishing-principles URL.
- Changed the document language to `en-CA`.
- Retained and reviewed the existing article canonical URLs, article Open Graph metadata, Twitter cards, NewsArticle JSON-LD, robots file, regular sitemap, RSS route, and 48-hour news sitemap.
- Converted the lead article image to `next/image` with explicit dimensions, responsive sizes, and priority loading to improve LCP and image SEO.

### Performance and platform hardening

- Upgraded Next.js from the vulnerable installed 16.2.4 release to 16.2.10.
- Pinned the newly added sanitizer packages rather than using floating versions.
- Enabled compression, AVIF/WebP output, and removed the `X-Powered-By` header.
- Added production security headers:
  - Content-Security-Policy
  - Strict-Transport-Security
  - X-Content-Type-Options
  - X-Frame-Options
  - Referrer-Policy
  - Permissions-Policy
  - Cross-Origin-Opener-Policy
- API responses are configured with `Cache-Control: no-store` by default. Existing feed routes retain their own explicit caching behaviour.

## Verification

Passed:

- `npm ci`
- `npx tsc --noEmit` after regenerating Next.js route types
- Production Webpack build covering every admin route: `next build --webpack --debug-build-paths="src/app/admin/**"`
- Production Webpack build covering every non-admin route: `next build --webpack --debug-build-paths="src/app/**,!src/app/admin/**"`
- Package lock regeneration
- ZIP integrity validation
- Source-level inspection of navigation, article rendering, metadata, feeds, API uploads, Supabase client usage, and admin access flow

The regenerated Next.js route types exposed and this release fixes two additional Next.js 16 compatibility errors in:

- `src/app/invite/[token]/page.tsx`
- `src/app/visitor-guide/[slug]/page.tsx`

Build environment note:

- A single monolithic build of all 408 routes exceeded the sandbox command window while remaining in the compilation stage and emitted no compiler error. To avoid treating a timeout as proof, the project was split into two exhaustive, non-overlapping production builds. Together they cover every App Router route in the project, and both completed successfully. You should still run the normal `npm run build` command locally before pushing, as documented in `DEPLOYMENT-v0.47.0.md`.
- A true Supabase RLS audit could not be verified against the live database policies because the ZIP contains historical SQL files but no authenticated connection to the production Supabase project. The repaired UI gate does not replace RLS. Production tables and storage buckets must still deny unauthorized writes at the database/storage policy level.
- CSP includes `'unsafe-inline'` and `'unsafe-eval'` for compatibility with the current Next.js application. A future nonce-based CSP is recommended after verifying every third-party script and embedded service.
- Four production dependency advisories remain in transitive packages according to `npm audit --omit=dev`. They are not fixed automatically here because forcing dependency changes could introduce breaking upgrades. Re-run `npm audit` in CI and evaluate each advisory against actual runtime exposure.

## Files changed

- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/articles/[slug]/page.tsx`
- `src/app/api/media/upload/route.ts`
- `src/components/AdminGate.tsx`
- `src/components/Header.tsx`
- `src/lib/sanitize-html.ts` (new)
- `src/app/invite/[token]/page.tsx`
- `src/app/visitor-guide/[slug]/page.tsx`
- `CHANGELOG-v0.47.0.md` (new)
- `DEPLOYMENT-v0.47.0.md` (new)

## Deployment

No Supabase migration is required for this release.

Use the exact replacement, PowerShell, Git, Vercel, and live-site verification workflow in `DEPLOYMENT-v0.47.0.md`.

## Packaging correction
- Replaced 21 internal build-environment npm registry URLs in `package-lock.json` with public `https://registry.npmjs.org/` URLs.
- This correction allows `npm ci` to run from a normal Windows computer outside the OpenAI build environment.
