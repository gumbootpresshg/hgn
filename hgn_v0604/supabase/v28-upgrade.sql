-- HGN v28 article organization/editorial controls
alter table articles add column if not exists section text;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists sort_order integer default 0;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists category text;
alter table articles add column if not exists author_name text;
alter table articles add column if not exists status text default 'draft';
alter table articles add column if not exists published_at timestamp with time zone;

create unique index if not exists articles_slug_unique on articles(slug);
create index if not exists articles_status_published_idx on articles(status, published_at desc);
create index if not exists articles_category_idx on articles(category);
create index if not exists articles_front_page_main_idx on articles(front_page_main);
create index if not exists articles_featured_idx on articles(featured);

-- clean WordPress artifacts and old escaped HTML
update articles set body = replace(body, '&lt;', '<') where body like '%&lt;%';
update articles set body = replace(body, '&gt;', '>') where body like '%&gt;%';
update articles set body = replace(body, '&quot;', '"') where body like '%&quot;%';
update articles set body = replace(body, '&nbsp;', ' ') where body like '%&nbsp;%';
update articles set body = regexp_replace(body, '<!-- wp:[^>]*-->', '', 'g') where body like '%<!-- wp:%';
update articles set body = regexp_replace(body, '<!-- /wp:[^>]*-->', '', 'g') where body like '%<!-- /wp:%';
update articles set body = regexp_replace(body, '<p class="[^"]*">', '<p>', 'g') where body like '%<p class=%';

-- make single-name imported authors display nicer where possible
update articles
set author_name = initcap(replace(replace(author_name, '.', ' '), '_', ' '))
where author_name is not null and author_name = lower(author_name);

-- backfill section from category
update articles set section = category where section is null and category is not null;
