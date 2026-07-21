# Install HGN on a new Windows computer

Open PowerShell in the project folder and run:

```powershell
cd C:\HGN\HGNSite

# Stop any Node processes that may be locking node_modules
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove any incomplete dependency install
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue

# Ensure npm uses the public registry and no stale proxy
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
npm cache clean --force

# Install exactly from package-lock.json
npm ci

# Start local development server
npm run dev
```

Open http://localhost:3000.

Before deployment:

```powershell
npx tsc --noEmit
npm run build
git add --all
git commit -m "Harden HGN security navigation and SEO"
git push origin main
```
