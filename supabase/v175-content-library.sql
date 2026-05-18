-- HGN v175 - Admin Content Library
-- Adds/repairs editor-facing tables and policies for managing past articles and letters.
-- Safe to rerun.

create extension if not exists pgcrypto;

-- Articles table: supports existing/past articles, drafts, publishing, editing.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text,
  dek text,
  excerpt text,
  body text,
  content text,
  category text,
  author text,
  image_url text,
  image_alt text,
  status text not null default 'draft',
  is_featured boolean default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

update public.articles
set status = case
  when lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active') then 'published'
  when lower(coalesce(status, '')) in ('draft', 'pending', 'review') then coalesce(nullif(status, ''), 'draft')
  else coalesce(nullif(status, ''), 'draft')
end,
published_at = case
  when lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active') then coalesce(published_at, updated_at, created_at, now())
  else published_at
end,
body = coalesce(nullif(body, ''), content),
content = coalesce(nullif(content, ''), body),
excerpt = coalesce(nullif(excerpt, ''), dek),
updated_at = now()
where status is null
   or status = ''
   or body is null
   or body = ''
   or content is null
   or content = ''
   or excerpt is null
   or excerpt = '';

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

-- Letters table: preserve archive and expose editor controls.
create table if not exists public.letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid,
  name text,
  email text,
  phone text,
  community text,
  location text,
  subject text,
  message text,
  body text,
  letter text,
  edited_subject text,
  edited_body text,
  status text not null default 'draft',
  source text default 'editor',
  published_at timestamptz,
  edited_at timestamptz,
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.letters_to_editor add column if not exists submission_id uuid;
alter table public.letters_to_editor add column if not exists name text;
alter table public.letters_to_editor add column if not exists email text;
alter table public.letters_to_editor add column if not exists phone text;
alter table public.letters_to_editor add column if not exists community text;
alter table public.letters_to_editor add column if not exists location text;
alter table public.letters_to_editor add column if not exists subject text;
alter table public.letters_to_editor add column if not exists message text;
alter table public.letters_to_editor add column if not exists body text;
alter table public.letters_to_editor add column if not exists letter text;
alter table public.letters_to_editor add column if not exists edited_subject text;
alter table public.letters_to_editor add column if not exists edited_body text;
alter table public.letters_to_editor add column if not exists status text default 'draft';
alter table public.letters_to_editor add column if not exists source text default 'editor';
alter table public.letters_to_editor add column if not exists published_at timestamptz;
alter table public.letters_to_editor add column if not exists edited_at timestamptz;
alter table public.letters_to_editor add column if not exists editor_notes text;
alter table public.letters_to_editor add column if not exists created_at timestamptz default now();
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

update public.letters_to_editor
set letter = coalesce(nullif(letter, ''), nullif(edited_body, ''), nullif(body, ''), nullif(message, ''), 'Letter text unavailable.'),
    body = coalesce(nullif(body, ''), nullif(edited_body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.'),
    message = coalesce(nullif(message, ''), nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), 'Letter text unavailable.'),
    edited_body = coalesce(nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.'),
    edited_subject = coalesce(nullif(edited_subject, ''), nullif(subject, ''), 'Letter to the Editor'),
    community = coalesce(nullif(community, ''), nullif(location, ''), 'Community not provided'),
    status = case
      when lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active') then 'approved'
      when status is null or status = '' then 'draft'
      else status
    end,
    published_at = case
      when lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active') then coalesce(published_at, updated_at, created_at, now())
      else published_at
    end,
    updated_at = now()
where letter is null
   or letter = ''
   or edited_body is null
   or edited_body = ''
   or community is null
   or community = ''
   or status is null
   or status = '';

alter table public.letters_to_editor
  alter column letter set default 'Letter text unavailable.';

alter table public.letters_to_editor enable row level security;

drop policy if exists "letters_public_read_published" on public.letters_to_editor;
drop policy if exists letters_public_read_published on public.letters_to_editor;
create policy "letters_public_read_published"
on public.letters_to_editor
for select
to anon, authenticated
using (lower(coalesce(status, '')) in ('approved', 'published', 'public', 'live', 'active'));

drop policy if exists "letters_authenticated_manage" on public.letters_to_editor;
drop policy if exists letters_authenticated_manage on public.letters_to_editor;
drop policy if exists "letters_authenticated_moderate" on public.letters_to_editor;
drop policy if exists letters_authenticated_moderate on public.letters_to_editor;
create policy "letters_authenticated_manage"
on public.letters_to_editor
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_letters_status_published
on public.letters_to_editor (status, published_at desc, created_at desc);
