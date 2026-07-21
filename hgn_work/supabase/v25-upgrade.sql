-- HGN v25 cleanup: fix double-escaped WordPress article HTML and common raw WordPress markup.

create unique index if not exists articles_slug_unique on articles(slug);

update articles set body = replace(body, '&amp;lt;', '&lt;') where body like '%&amp;lt;%';
update articles set body = replace(body, '&amp;gt;', '&gt;') where body like '%&amp;gt;%';
update articles set body = replace(body, '&lt;', '<') where body like '%&lt;%';
update articles set body = replace(body, '&gt;', '>') where body like '%&gt;%';
update articles set body = replace(body, '&quot;', '"') where body like '%&quot;%';
update articles set body = replace(body, '&#039;', '''') where body like '%&#039;%';
update articles set body = replace(body, '&nbsp;', ' ') where body like '%&nbsp;%';
update articles set body = regexp_replace(body, '<!--[[:space:]]*/?wp:[^>]*-->', '', 'g') where body like '%<!--%wp:%';
update articles set body = regexp_replace(body, '<p[[:space:]]+class="">', '<p>', 'g') where body like '%<p class="">%';
