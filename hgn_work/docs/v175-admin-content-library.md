# HGN v175 — Admin Content Library

This adds the missing editor/publisher area for past articles and letters.

## New admin routes

- `/admin/content`
- `/admin/content/articles/[id]`
- `/admin/content/letters/[id]`

## What it does

- Shows existing articles from `articles`
- Shows published/archived letters from `letters_to_editor`
- Lets editor change status:
  - publish
  - draft
  - archive
  - delete
- Lets editor open edit pages for articles and letters
- Keeps `/admin/letters` for submitted-but-not-yet-published letters
- Keeps `/admin/submissions` for incoming reader submissions/classifieds/jobs

## Where to look now

- New letter submissions: `/admin/letters`
- Published/past letters: `/admin/content`
- Past articles: `/admin/content`
- All incoming submissions: `/admin/submissions`

## SQL to run

`supabase/v175-content-library.sql`

## Source table hints found while packaging

- `src/app/page.tsx` uses `articles`
- `src/app/archive/page.tsx` uses `articles`
- `src/app/articles/page.tsx` uses `articles`
- `src/app/contribute/page.tsx` uses `articles`
- `src/app/letters/page.tsx` uses `letters_to_editor`
- `src/app/opinion/page.tsx` uses `articles`
- `src/app/articles/[slug]/page.tsx` uses `articles`
- `src/app/admin/articles/page.tsx` uses `articles`
- `src/app/admin/publish/page.tsx` uses `articles`
- `src/app/admin/seo/page.tsx` uses `articles`
- `src/app/admin/social/page.tsx` uses `articles`
- `src/app/admin/letters/page.tsx` uses `letters_to_editor`
- `src/app/admin/articles/[id]/page.tsx` uses `articles`
