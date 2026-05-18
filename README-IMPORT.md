# HGN WordPress Importer

## 1) Copy these files into your project
Unzip this package into:

`C:\hgn\hgnsite`

It should add:

- `scripts/import-wordpress-xml.mjs`
- `imports/wordpress-export.xml`
- `.env.import.local.example`
- `supabase/wordpress-import-prep.sql`
- `package.importer.json`

## 2) Install required importer packages
In PowerShell:

```powershell
cd C:\hgn\hgnsite
npm install @supabase/supabase-js dotenv fast-xml-parser slugify
```

## 3) Create your import env file
Copy:

`.env.import.local.example`

to:

`.env.import.local`

Fill in:

```env
SUPABASE_URL=https://YOURPROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_SECRET_KEY
WORDPRESS_XML_PATH=imports/wordpress-export.xml
DEFAULT_SECTION=Local News
DEFAULT_STATUS=published
```

Use the **service_role secret key** only here. Never put it in a `NEXT_PUBLIC_` variable.

## 4) Run the SQL prep
Open Supabase SQL Editor, open/copy the contents of:

`supabase/wordpress-import-prep.sql`

Paste the SQL itself into Supabase and run it.

## 5) Dry run first
```powershell
node scripts/import-wordpress-xml.mjs --dry
```

You should see article titles listed.

## 6) Real import
```powershell
node scripts/import-wordpress-xml.mjs
```

Articles are upserted by slug, so rerunning should not create duplicates.
