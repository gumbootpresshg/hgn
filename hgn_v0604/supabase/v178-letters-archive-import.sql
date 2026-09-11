-- HGN v178 - Letters Archive Import
-- Helps recover older Letters to the Editor that may live in articles/opinion rows instead of letters_to_editor.
-- Safe to rerun.

create extension if not exists pgcrypto;

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
alter table public.letters_to_editor add column if not exists status text default 'approved';
alter table public.letters_to_editor add column if not exists source text default 'editor';
alter table public.letters_to_editor add column if not exists source_article_id uuid;
alter table public.letters_to_editor add column if not exists published_at timestamptz;
alter table public.letters_to_editor add column if not exists edited_at timestamptz;
alter table public.letters_to_editor add column if not exists editor_notes text;
alter table public.letters_to_editor add column if not exists created_at timestamptz default now();
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

-- Import likely older letters from articles.
-- This catches rows categorized/tagged/titled as letters/opinion where the content still lives in articles.
insert into public.letters_to_editor (
  source_article_id,
  name,
  community,
  subject,
  message,
  body,
  letter,
  edited_subject,
  edited_body,
  status,
  source,
  published_at,
  created_at,
  updated_at
)
select
  a.id,
  coalesce(nullif(a.author, ''), 'Name withheld') as name,
  'Community not provided' as community,
  coalesce(nullif(a.title, ''), 'Letter to the Editor') as subject,
  coalesce(nullif(a.body, ''), nullif(a.content, ''), nullif(a.excerpt, ''), nullif(a.dek, ''), 'Letter text unavailable.') as message,
  coalesce(nullif(a.body, ''), nullif(a.content, ''), nullif(a.excerpt, ''), nullif(a.dek, ''), 'Letter text unavailable.') as body,
  coalesce(nullif(a.body, ''), nullif(a.content, ''), nullif(a.excerpt, ''), nullif(a.dek, ''), 'Letter text unavailable.') as letter,
  coalesce(nullif(a.title, ''), 'Letter to the Editor') as edited_subject,
  coalesce(nullif(a.body, ''), nullif(a.content, ''), nullif(a.excerpt, ''), nullif(a.dek, ''), 'Letter text unavailable.') as edited_body,
  'approved' as status,
  'article_import' as source,
  coalesce(a.published_at, a.created_at, now()) as published_at,
  coalesce(a.created_at, now()) as created_at,
  now() as updated_at
from public.articles a
where (
    lower(coalesce(a.category, '')) like '%letter%'
    or lower(coalesce(a.category, '')) like '%opinion%'
    or lower(coalesce(a.title, '')) like '%letter to the editor%'
    or lower(coalesce(a.title, '')) like '%letter:%'
    or lower(coalesce(a.slug, '')) like '%letter%'
    or lower(coalesce(a.slug, '')) like '%opinion%'
  )
  and lower(coalesce(a.status, '')) in ('published', 'approved', 'public', 'live', 'active')
  and not exists (
    select 1
    from public.letters_to_editor l
    where l.source_article_id = a.id
  );

update public.letters_to_editor
set letter = coalesce(nullif(letter, ''), nullif(edited_body, ''), nullif(body, ''), nullif(message, ''), 'Letter text unavailable.'),
    body = coalesce(nullif(body, ''), nullif(edited_body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.'),
    message = coalesce(nullif(message, ''), nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), 'Letter text unavailable.'),
    edited_body = coalesce(nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.'),
    edited_subject = coalesce(nullif(edited_subject, ''), nullif(subject, ''), 'Letter to the Editor'),
    community = coalesce(nullif(community, ''), nullif(location, ''), 'Community not provided'),
    status = case
      when lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active') then 'approved'
      when status is null or status = '' then 'approved'
      else status
    end,
    published_at = coalesce(published_at, updated_at, created_at, now()),
    updated_at = now()
where letter is null
   or letter = ''
   or edited_body is null
   or edited_body = ''
   or community is null
   or community = ''
   or published_at is null
   or status is null
   or status = '';

alter table public.letters_to_editor alter column letter set default 'Letter text unavailable.';

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

create index if not exists idx_letters_source_article_id
on public.letters_to_editor (source_article_id)
where source_article_id is not null;

create index if not exists idx_letters_status_published
on public.letters_to_editor (status, published_at desc, created_at desc);
