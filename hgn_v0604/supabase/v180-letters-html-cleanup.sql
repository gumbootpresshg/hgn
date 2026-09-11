-- HGN v180 - Letters HTML Cleanup
-- Cleans imported WordPress-style HTML in old letters.
-- Converts paragraph tags and basic entities into readable plain text.
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
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

create or replace function public.hgn_clean_imported_html(input_text text)
returns text
language sql
immutable
as $$
  select trim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(
                        coalesce(input_text, ''),
                        '<\s*/\s*p\s*>', E'\n\n', 'gi'
                      ),
                      '<\s*p[^>]*>', '', 'gi'
                    ),
                    '<\s*br\s*/?\s*>', E'\n', 'gi'
                  ),
                  '<\s*/\s*div\s*>', E'\n\n', 'gi'
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
  );
$$;

update public.letters_to_editor
set
  letter = public.hgn_clean_imported_html(coalesce(nullif(letter, ''), nullif(edited_body, ''), nullif(body, ''), nullif(message, ''), 'Letter text unavailable.')),
  body = public.hgn_clean_imported_html(coalesce(nullif(body, ''), nullif(edited_body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.')),
  message = public.hgn_clean_imported_html(coalesce(nullif(message, ''), nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), 'Letter text unavailable.')),
  edited_body = public.hgn_clean_imported_html(coalesce(nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.')),
  edited_subject = coalesce(nullif(edited_subject, ''), nullif(subject, ''), 'Letter to the Editor'),
  community = coalesce(nullif(community, ''), nullif(location, ''), 'Community not provided'),
  email = coalesce(nullif(email, ''), 'archive-import@haidagwaiinews.local'),
  name = coalesce(nullif(name, ''), 'Name withheld'),
  updated_at = now()
where coalesce(letter, body, message, edited_body, '') ilike '%<%>%'
   or letter is null
   or body is null
   or message is null
   or edited_body is null
   or community is null
   or email is null
   or name is null;

-- Try to extract simple trailing author/community lines from imported letters when name/community are placeholders.
-- This keeps the full text visible but improves the byline when possible.
update public.letters_to_editor
set name = trim(split_part(regexp_replace(edited_body, E'.*\n\n([^\n]+)\n\n([^\n]+)\s*$', E'\1', 's'), E'\n', 1)),
    community = trim(regexp_replace(edited_body, E'.*\n\n([^\n]+)\n\n([^\n]+)\s*$', E'\2', 's')),
    location = trim(regexp_replace(edited_body, E'.*\n\n([^\n]+)\n\n([^\n]+)\s*$', E'\2', 's')),
    updated_at = now()
where (name = 'Name withheld' or community = 'Community not provided')
  and edited_body ~ E'\n\n[^\n]+\n\n[^\n]+\s*$';

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
