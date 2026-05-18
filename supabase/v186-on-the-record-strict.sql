-- HGN v186 - On the Record Strict Cleanup
-- Keeps Editorial content out of On the Record.
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.articles add column if not exists category text;
alter table public.articles add column if not exists slug text;
alter table public.articles add column if not exists title text;
alter table public.articles add column if not exists updated_at timestamptz default now();

-- First, mark true On the Record rows only where title/slug/category clearly says On the Record.
update public.articles
set category = 'On the Record',
    updated_at = now()
where lower(coalesce(title, '')) like '%on the record%'
   or lower(coalesce(slug, '')) like '%on-the-record%'
   or lower(coalesce(category, '')) in ('on the record', 'on-the-record', 'on_record');

-- Then force anything that clearly says editorial back to Editorial unless it explicitly says On the Record.
update public.articles
set category = 'Editorial',
    updated_at = now()
where (
    lower(coalesce(title, '')) like '%editorial%'
    or lower(coalesce(slug, '')) like '%editorial%'
    or lower(coalesce(category, '')) in ('editorial', 'editorials')
  )
  and lower(coalesce(title, '')) not like '%on the record%'
  and lower(coalesce(slug, '')) not like '%on-the-record%';

-- If category is On the Record but the row has no On the Record signal and does have editorial signal, move it out.
update public.articles
set category = 'Editorial',
    updated_at = now()
where lower(coalesce(category, '')) = 'on the record'
  and lower(coalesce(title, '')) not like '%on the record%'
  and lower(coalesce(slug, '')) not like '%on-the-record%'
  and (
    lower(coalesce(title, '')) like '%editorial%'
    or lower(coalesce(slug, '')) like '%editorial%'
  );

create index if not exists idx_articles_category_slug_title
on public.articles (category, slug, title);
