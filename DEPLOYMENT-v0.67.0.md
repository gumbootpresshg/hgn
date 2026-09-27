# Deploy HGN v0.67.0

No Supabase migration is required.

Overlay the release onto `C:\HGN\HGNSite`, preserving `.git` and `.env.local`, then run:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Use **Admin → Island Lens** and choose multiple photos in the **Add gallery photos** picker. The browser prepares each one for a fast, good-quality gallery before upload.
