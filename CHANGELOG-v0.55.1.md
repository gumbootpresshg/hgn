# HGN v0.55.1

## Theme Studio build repair

- Fixed the Theme Studio authentication headers return type so it is always a valid `Record<string, string>` for `fetch`.
- Resolves the Vercel TypeScript error in `src/app/admin/theme-studio/page.tsx` where the empty header object was inferred as an optional `Authorization` value.
- No Supabase migration is required.
