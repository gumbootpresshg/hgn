# HGN v0.60.2 deployment

1. Run `supabase/v279-contact-correspondence.sql` in the public HGN Supabase project.
2. Preserve `.env.local` and `.git` when copying the release over `C:\HGN\HGNSite`.
3. Confirm Vercel has `RESEND_API_KEY`, `HGN_ALERT_EMAIL_FROM`, and `HGN_PUBLIC_SITE_WEBHOOK_SECRET`.
4. Validate locally:

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

5. Deploy:

```powershell
git add --all
git commit -m "Add contact correspondence inbox and notification settings"
git push origin main
```

6. Test `/contact`, `/admin/contact-messages`, and `/admin/settings/contact` after Vercel reports Ready.
