# Deploy HGN v0.63.1

No Supabase migration is required.

## Overlay the release

```powershell
cd C:\HGN

Remove-Item "C:\HGN\v0631-temp" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "C:\HGN\v0631-temp" | Out-Null

Expand-Archive "$env:USERPROFILE\Downloads\HGN-v0.63.1-navigation-flash-visibility-fix-LOCAL-VALIDATION.zip" `
  -DestinationPath "C:\HGN\v0631-temp" -Force

robocopy "C:\HGN\v0631-temp" "C:\HGN\HGNSite" /MIR `
  /XD ".git" "node_modules" ".next" `
  /XF ".env" ".env.local"
```

## Verify the overlay

```powershell
cd C:\HGN\HGNSite
git status --short
Select-String -Path ".\package.json" -Pattern '"version"'
```

Expected package version: `0.63.1`.

## Validate

```powershell
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue

npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## Deploy

```powershell
git add --all
git commit -m "Fix navigation flash and visibility"
git push origin main
```

Vercel deploys automatically from `main`.
