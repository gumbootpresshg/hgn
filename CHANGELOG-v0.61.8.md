# HGN v0.61.8 - Incoming Queue TypeScript Fix

- Fixed the `authHeaders()` return type in the public admin Submissions queue.
- Prevents Next.js/Vercel TypeScript from treating an optional `authorization` value as `undefined` inside `HeadersInit`.
- No workflow, database, or Supabase schema changes.
- Supersedes v0.61.7 for deployment.
