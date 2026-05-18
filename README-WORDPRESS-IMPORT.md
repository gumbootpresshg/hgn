# HGN WordPress Article Import

Your WordPress XML export is included here:

```text
imports/haidagwaiinews.WordPress.2026-04-28.xml
```

## 1) Run the SQL first

In Supabase SQL Editor, run:

```text
supabase/v21-upgrade.sql
```

## 2) Add a local-only service key

Create this file in the project root:

```text
.env.import.local
```

Add:

```env
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE
```

Find it in Supabase: Project Settings → API → service_role key.

Do **not** put this key in a `NEXT_PUBLIC_` variable.

## 3) Preview first

```powershell
npm run import:wp:dry
```

## 4) Import

```powershell
npm run import:wp
```

It imports WordPress posts into `articles` and updates/skips duplicates by `wordpress_id`.

Images are stored as the old WordPress image URLs for now. Later we can migrate images into Supabase Storage.
