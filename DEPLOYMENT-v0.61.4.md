# HGN v0.61.4 Deployment

## 1. Database
Run the following file in the **public HGN Supabase project** SQL Editor:

`supabase/v281-writers-columns.sql`

Do not run this migration in HGN Operations.

## 2. Install over the existing public site
Preserve the existing `.git` directory and `.env.local` file in `C:\HGN\HGNSite`.

## 3. Validate locally

```powershell
cd C:\HGN\HGNSite

Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue

npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

Do not push if typecheck or build fails.

## 4. Deploy

```powershell
git add --all
git commit -m "Add writers and columns management"
git push origin main
```

Vercel deploys `main` automatically.

## 5. Smoke test
- `/admin/authors` loads current bylines after migration.
- Add or edit an author and upload a photo.
- `/admin/columns` shows compact collapsed rows.
- Assign a writer to a column.
- Create/edit an article and select an Author from the dropdown.
- Publish and verify the byline links to `/authors/[slug]`.
- Verify the writer page lists the published article.
- Verify Opinion > Columns shows active columns.
