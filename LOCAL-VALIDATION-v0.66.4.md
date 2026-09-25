# HGN v0.66.4 local validation

- Source inspection: confirmed the public signup endpoint uses the existing `subscribers`, newsletter products and Resend welcome-email architecture.
- Newsletter signup behaviour: reviewed to ensure one active public product is selected server-side even if the browser omits product data; paused products are not eligible.
- Subscriber preservation: reviewed to ensure signup updates do not overwrite the existing optional `town` column.
- Migration review: `v295-newsletter-signup-simplification.sql` is additive and does not touch subscriber preference data.
- `npm install`: passed; dependencies were already current.
- `npm run typecheck`: passed (run again after the final Guide-preference preservation change).
- `npm run build`: started, then failed in the hosted sandbox before application route generation. Next.js/Turbopack reported `Operation not permitted` while attempting to create a process/bind a port for an existing `leaflet/dist/leaflet.css` dependency. This environment restriction is unrelated to the newsletter changes; run the build in `C:\HGN\HGNSite` before pushing.
- Public form audit: confirms no town field or newsletter-choice UI is rendered when exactly one eligible newsletter is active.
- ZIP integrity test: passed. The release ZIP contains the complete project source and excludes `.git`, `node_modules`, `.next`, `.env`, `.env.local` and `*.tsbuildinfo`.
