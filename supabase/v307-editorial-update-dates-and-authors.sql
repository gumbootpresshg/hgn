-- HGN v0.67.37 - separate editorial updates from routine technical maintenance.
alter table public.articles add column if not exists editorial_updated_at timestamptz;
create index if not exists idx_articles_editorial_updated_at on public.articles(editorial_updated_at desc);

-- Existing archive records have no verified editorial revision timestamp. Their
-- public dateModified will therefore remain their original publication date.
update public.articles
set editorial_updated_at = null
where editorial_updated_at is not null
  and editorial_updated_at <= coalesce(published_at, created_at);

-- Restore the database timestamps affected by the October 27 technical cleanup.
-- This intentionally affects only stories published before that date.
update public.articles
set updated_at = coalesce(published_at, created_at)
where updated_at >= '2026-10-27T00:00:00-07:00'::timestamptz
  and updated_at < '2026-10-28T00:00:00-07:00'::timestamptz
  and coalesce(published_at, created_at) < '2026-10-27T00:00:00-07:00'::timestamptz;

-- Ensure known historical bylines have public profiles and link their stories.
insert into public.hgn_authors (display_name, slug, writer_type, short_bio, bio, is_active, sort_order)
values
  ('Andrew Hudson', 'andrew-hudson', 'contributor', 'Contributor to Haida Gwaii News.', 'Andrew Hudson is a contributor to Haida Gwaii News.', true, 40),
  ('Chris Williams', 'chris-williams', 'contributor', 'Contributor to Haida Gwaii News.', 'Chris Williams is a contributor to Haida Gwaii News.', true, 50),
  ('Berry Wijdeven', 'berry-wijdeven', 'contributor', 'Contributor to Haida Gwaii News.', 'Berry Wijdeven is a contributor to Haida Gwaii News.', true, 60),
  ('Submitted', 'submitted', 'contributor', 'Community material submitted to Haida Gwaii News.', 'Items published as submitted material are credited to the organization or individual who supplied them whenever that information is available.', true, 900),
  ('David Suzuki', 'david-suzuki', 'contributor', 'Writer and environmentalist.', 'David Suzuki is a Canadian scientist, broadcaster and writer.', true, 70),
  ('Ian Hanington', 'ian-hanington', 'contributor', 'Writer and editor.', 'Ian Hanington is a writer and editor.', true, 80)
on conflict (slug) do update set
  is_active = true,
  writer_type = excluded.writer_type,
  short_bio = coalesce(public.hgn_authors.short_bio, excluded.short_bio),
  bio = coalesce(public.hgn_authors.bio, excluded.bio);

update public.hgn_authors
set writer_type = 'publisher / editor',
    short_bio = coalesce(nullif(short_bio, ''), 'Publisher and Editor of Haida Gwaii News.'),
    bio = coalesce(nullif(bio, ''), 'Stacey Brzostowski is the Publisher and Editor of Haida Gwaii News.')
where lower(display_name) = 'stacey brzostowski';

update public.hgn_authors
set bio = coalesce(nullif(bio, ''), 'Bob Loblaw is a pen name used by a Haida Gwaii News contributor.')
where lower(display_name) = 'bob loblaw';

update public.articles a
set writer_id = w.id
from public.hgn_authors w
where lower(trim(coalesce(nullif(a.author_name, ''), nullif(a.author, '')))) = lower(trim(w.display_name))
  and w.slug in ('andrew-hudson', 'chris-williams', 'berry-wijdeven', 'submitted', 'david-suzuki', 'ian-hanington');
