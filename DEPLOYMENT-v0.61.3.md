# Deploy HGN v0.61.3

Public project path: `C:\HGN\HGNSite`

Preserve the existing `.git` directory and `.env.local` when copying this release over the working project.

## Validate

```powershell
cd C:\HGN\HGNSite
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not push if typecheck or build fails.

## Deploy

```powershell
git add --all
git commit -m "Improve article editor save feedback and draft recovery"
git push origin main
```

Vercel deploys automatically from `main`.

## Verification
1. Open an existing article in admin.
2. Change the body and verify the status changes to `Unsaved changes - protected in this browser`.
3. Switch to another browser tab for 10-20 seconds and return. The pasted body should remain.
4. Refresh with unsaved changes and cancel the browser warning once to verify it appears.
5. After allowing a refresh/reopen, verify the local recovery copy is restored.
6. Click Save Draft and verify `Saving...`, then `Saved <time>` and the success notice.
7. Publish a test draft and verify `Publishing...`, then the published confirmation.
8. Hover and press the editor buttons on desktop to verify clear interaction feedback.
