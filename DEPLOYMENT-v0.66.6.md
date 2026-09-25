# Deploy HGN v0.66.6

No Supabase migration is required for this release.

1. Extract the release ZIP to a temporary folder.
2. Overlay its contents onto `C:\HGN\HGNSite`, preserving `.git` and `.env.local`.
3. Clear `.next` and TypeScript build information.
4. Run `npm.cmd install`, `npm.cmd run typecheck`, and `npm.cmd run build`.
5. Review the Git diff, commit, and push `main`.

After deployment, enter staff calendar events at `/admin/events`. Use **New Event** for items HGN is entering itself; use **Community submissions** only to review items sent through the public form.
