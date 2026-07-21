-- HGN v24 WordPress cleanup and import safety

alter table if exists articles add column if not exists wordpress_id text;
alter table if exists articles add column if not exists original_url text;
alter table if exists articles add column if not exists imported_from text;
alter table if exists articles add column if not exists imported_at timestamptz;
alter table if exists articles add column if not exists tags text[];

-- Importer now upserts on slug.
delete from articles where slug is null or trim(slug) = '';
create unique index if not exists articles_slug_unique on articles(slug);

-- Clean WordPress block comments, escaped HTML, empty classes, and spacing already imported.
update articles
set body = replace(replace(body, '&lt;', '<'), '&gt;', '>')
where body is not null and (body like '%&lt;%' or body like '%&gt;%');

update articles
set body = regexp_replace(body, '<!--\s*/?wp:[^>]*-->', '', 'g')
where body is not null;

update articles
set body = replace(replace(body, '&nbsp;', ' '), '&#160;', ' ')
where body is not null;

update articles
set body = regexp_replace(body, '<p\s+class="[^"]*">', '<p>', 'g')
where body is not null;

update articles
set body = regexp_replace(body, '<p>\s*</p>', '', 'g')
where body is not null;
