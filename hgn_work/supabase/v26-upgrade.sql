alter table articles add column if not exists image_url text;
create unique index if not exists articles_slug_unique on articles(slug);

update articles set body = replace(body, '&lt;', '<') where body like '%&lt;%';
update articles set body = replace(body, '&gt;', '>') where body like '%&gt;%';
update articles set body = replace(body, '&quot;', '"') where body like '%&quot;%';
update articles set body = replace(body, '&#039;', '''') where body like '%&#039;%';
update articles set body = replace(body, '&nbsp;', ' ') where body like '%&nbsp;%';
update articles set body = regexp_replace(body, '<!-- wp:[^>]*-->', '', 'g');
update articles set body = regexp_replace(body, '<!-- /wp:[^>]*-->', '', 'g');
update articles set body = regexp_replace(body, '<p class="[^"]*">', '<p>', 'g');
