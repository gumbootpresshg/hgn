# HGN v172 Full Updated Package

Use this as the latest full replacement folder.

Keep from your local folder:
- `.env.local`
- `node_modules` if you want, or reinstall with `npm install`

Replace everything else with this package.

Then run:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
