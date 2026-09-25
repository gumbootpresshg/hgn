# HGN v0.65.9 — Newsletter Publisher Suite

## Included

- Publisher-managed newsletter products, including status, public/account visibility, acceptance, sending, archive visibility, featured/default, sender and reply-to settings.
- `Haida Gwaii Guide` is seeded as **Paused** and hidden from public signup and account choices. Existing Guide preferences are preserved.
- Publisher-editable newsletter signup page with reader-facing copy and optional advertising CTA.
- Newsletter advertising inventory with top, mid-newsletter, business-card and footer placements, campaign references, inventory status and browser-to-Supabase image upload.
- Product-aware builds and delivery. Paused products cannot be sent.
- Newsletter HTML includes clearly labelled advertisements and safe UTM parameters for editorial/ad links; preference links are excluded from tracking.
- Multiple-recipient `TEST EMAIL` sends without changing production subscriber/send state.
- Newsletter admin navigation, product editor, signup-page editor, ad manager and dashboard additions using only metrics actually stored in the current database.
- Build output now stores a simple ordered block list and selects active advertising for preview/send output.

## Database

Run `supabase/v291-newsletter-publisher-suite.sql` in the **Public HGN Supabase project** before deploying code.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — not completed in this execution sandbox: the runner terminated the Next build process and left its lock file before a result could be captured. Run the supplied local production build before committing.
