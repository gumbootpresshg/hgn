# Deployment v0.60.7

1. Preserve `.git` and `.env.local`.
2. Remove any stray `C:\HGN\HGNSite\hgn_v0604` folder.
3. Clear `.next` and `tsconfig.tsbuildinfo`.
4. Run `npm.cmd install`, `npm.cmd run typecheck`, and `npm.cmd run build`.
5. Commit and push to `main`.
