# HGN v243 — Article Share Hydration Fix

## Fixed

React hydration warning on article pages caused by `ArticleShare` rendering different share URLs on server and client.

## What changed

- Share buttons now render stable placeholder links during SSR.
- The current URL is filled after client mount with `useEffect`.
- Prevents server/client href mismatch for:
  - Facebook
  - X
  - LinkedIn
  - Email
  - Copy link

## SQL

No SQL required.
