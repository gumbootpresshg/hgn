-- HGN v176 - Articles body NOT NULL Fix
-- Fixes: null value in column "body" of relation "articles" violates not-null constraint.
-- Safe to run after the failed v175 attempt.

create extension if not exists pgcrypto;

alter table public.articles add column if not exists title text;
alter table public.articles add column if not exists slug text;
alter table public.articles add column if not exists dek text;
alter table public.articles add column if not exists excerpt text;
alter table public.articles add column if not exists body text;
alter table public.articles add column if not exists content text;
alter table public.articles add column if not exists category text;
alter table public.articles add column if not exists author text;
alter table public.articles add column if not exists image_url text;
alter table public.articles add column if not exists image_alt text;
alter table public.articles add column if not exists status text default 'draft';
alter table public.articles add column if not exists is_featured boolean default false;
alter table public.articles add column if not exists published_at timestamptz;
alter table public.articles add column if not exists created_at timestamptz default now();
alter table public.articles add column if not exists updated_at timestamptz default now();

-- Make sure required legacy columns always have a value before any normalization.
update public.articles
set body = coalesce(
      nullif(body, ''),
      nullif(content, ''),
      nullif(excerpt, ''),
      nullif(dek, ''),
      nullif(title, ''),
      'Article body not available yet.'
    ),
    content = coalesce(
      nullif(content, ''),
      nullif(body, ''),
      nullif(excerpt, ''),
      nullif(dek, ''),
      nullif(title, ''),
      'Article body not available yet.'
    ),
    excerpt = coalesce(
      nullif(excerpt, ''),
      nullif(dek, ''),
      nullif(title, ''),
      'No excerpt available.'
    ),
    dek = coalesce(
      nullif(dek, ''),
      nullif(excerpt, ''),
      nullif(title, ''),
      'No excerpt available.'
    ),
    title = coalesce(
      nullif(title, ''),
      'Untitled article'
    ),
    status = coalesce(
      nullif(status, ''),
      'draft'
    ),
    updated_at = now()
where body is null
   or body = ''
   or content is null
   or content = ''
   or excerpt is null
   or excerpt = ''
   or dek is null
   or dek = ''
   or title is null
   or title = ''
   or status is null
   or status = '';

-- Keep defaults safe for future rows.
alter table public.articles alter column body set default 'Article body not available yet.';
alter table public.articles alter column content set default 'Article body not available yet.';
alter table public.articles alter column title set default 'Untitled article';
alter table public.articles alter column status set default 'draft';

-- Normalize live statuses without ever touching body to null.
update public.articles
set status = case
      when lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active') then 'published'
      when lower(coalesce(status, '')) in ('draft', 'pending', 'review') then lower(status)
      when status is null or status = '' then 'draft'
      else status
    end,
    published_at = case
      when lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active') then coalesce(published_at, updated_at, created_at, now())
      else published_at
    end,
    updated_at = now();

alter table public.articles enable row level security;

drop policy if exists "articles_public_read_published" on public.articles;
drop policy if exists articles_public_read_published on public.articles;
create policy "articles_public_read_published"
on public.articles
for select
to anon, authenticated
using (lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active'));

drop policy if exists "articles_authenticated_manage" on public.articles;
drop policy if exists articles_authenticated_manage on public.articles;
create policy "articles_authenticated_manage"
on public.articles
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_articles_status_published
on public.articles (status, published_at desc, created_at desc);

create index if not exists idx_articles_slug
on public.articles (slug);
