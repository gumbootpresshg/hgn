# HGN v0.49.2 Local Validation

This update fixes expired Supabase access tokens during protected media uploads.

No Supabase migration is required.

## Validate

```powershell
cd C:\HGN\HGNSite
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm config set registry https://registry.npmjs.org/
npm ci
npx tsc --noEmit
npm run build
npm run dev
```

Open `http://localhost:3000/admin/front-page`, sign in, and upload a front-page photograph.

If the browser session has fully ended, the uploader will now show a clear sign-in message instead of `Invalid upload session`.
