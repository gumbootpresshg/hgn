# HGN v180 — Letters HTML Cleanup

This fixes imported old letters showing raw HTML like:

`<p>Text...</p>`

## Fixed

- SQL cleanup for old imported letters
- Converts paragraph tags into real spacing
- Removes remaining HTML tags
- Decodes common entities
- Adds display-time cleanup fallback
- Adds editor/import cleanup fallback

## SQL to run

`supabase/v180-letters-html-cleanup.sql`

## After running

1. Open `/letters`
2. Imported letters should read as normal paragraphs
3. Open `/admin/content/letters/[id]` to manually polish author/community if needed
