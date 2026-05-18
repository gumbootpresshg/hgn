-- HGN v181 - Letters HTML Cleanup SQL Fix
-- Simpler version of v180 without a SQL function body.
-- Fixes syntax error near CREATE by using plain UPDATE statements only.
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.letters_to_editor add column if not exists letter text;
alter table public.letters_to_editor add column if not exists body text;
alter table public.letters_to_editor add column if not exists message text;
alter table public.letters_to_editor add column if not exists edited_body text;
alter table public.letters_to_editor add column if not exists edited_subject text;
alter table public.letters_to_editor add column if not exists community text;
alter table public.letters_to_editor add column if not exists location text;
alter table public.letters_to_editor add column if not exists name text;
alter table public.letters_to_editor add column if not exists email text;
alter table public.letters_to_editor add column if not exists status text default 'approved';
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

-- First make sure all key fields have safe values.
update public.letters_to_editor
set letter = coalesce(nullif(letter, ''), nullif(edited_body, ''), nullif(body, ''), nullif(message, ''), 'Letter text unavailable.'),
    body = coalesce(nullif(body, ''), nullif(edited_body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.'),
    message = coalesce(nullif(message, ''), nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), 'Letter text unavailable.'),
    edited_body = coalesce(nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.'),
    edited_subject = coalesce(nullif(edited_subject, ''), nullif(subject, ''), 'Letter to the Editor'),
    community = coalesce(nullif(community, ''), nullif(location, ''), 'Community not provided'),
    email = coalesce(nullif(email, ''), 'archive-import@haidagwaiinews.local'),
    name = coalesce(nullif(name, ''), 'Name withheld'),
    status = coalesce(nullif(status, ''), 'approved'),
    updated_at = now();

-- Clean HTML tags in edited_body.
update public.letters_to_editor
set edited_body =
  trim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(edited_body, '<\s*/\s*p\s*>', chr(10) || chr(10), 'gi'),
                      '<\s*p[^>]*>', '', 'gi'
                    ),
                    '<\s*br\s*/?\s*>', chr(10), 'gi'
                  ),
                  '<\s*/\s*div\s*>', chr(10) || chr(10), 'gi'
                ),
                '<\s*div[^>]*>', '', 'gi'
              ),
              '<[^>]+>', '', 'gi'
            ),
            '&nbsp;', ' ', 'gi'
          ),
          '&amp;', '&', 'gi'
        ),
        '&quot;', '"', 'gi'
      ),
      '&#39;', '''', 'gi'
    )
  ),
  updated_at = now()
where edited_body ilike '%<%>%'
   or edited_body ilike '%&nbsp;%'
   or edited_body ilike '%&amp;%'
   or edited_body ilike '%&quot;%'
   or edited_body ilike '%&#39;%';

-- Clean HTML tags in letter.
update public.letters_to_editor
set letter =
  trim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(letter, '<\s*/\s*p\s*>', chr(10) || chr(10), 'gi'),
                      '<\s*p[^>]*>', '', 'gi'
                    ),
                    '<\s*br\s*/?\s*>', chr(10), 'gi'
                  ),
                  '<\s*/\s*div\s*>', chr(10) || chr(10), 'gi'
                ),
                '<\s*div[^>]*>', '', 'gi'
              ),
              '<[^>]+>', '', 'gi'
            ),
            '&nbsp;', ' ', 'gi'
          ),
          '&amp;', '&', 'gi'
        ),
        '&quot;', '"', 'gi'
      ),
      '&#39;', '''', 'gi'
    )
  ),
  updated_at = now()
where letter ilike '%<%>%'
   or letter ilike '%&nbsp;%'
   or letter ilike '%&amp;%'
   or letter ilike '%&quot;%'
   or letter ilike '%&#39;%';

-- Keep fields synced after cleanup.
update public.letters_to_editor
set body = coalesce(nullif(edited_body, ''), nullif(letter, ''), body),
    message = coalesce(nullif(edited_body, ''), nullif(letter, ''), message),
    letter = coalesce(nullif(letter, ''), nullif(edited_body, ''), 'Letter text unavailable.'),
    edited_body = coalesce(nullif(edited_body, ''), nullif(letter, ''), 'Letter text unavailable.'),
    updated_at = now();

alter table public.letters_to_editor alter column letter set default 'Letter text unavailable.';
alter table public.letters_to_editor alter column email set default 'archive-import@haidagwaiinews.local';

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
