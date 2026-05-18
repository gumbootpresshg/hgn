-- HGN v22 - WordPress import/article cleanup support

alter table articles add column if not exists wordpress_id text;
alter table articles add column if not exists original_url text;
alter table articles add column if not exists imported_from text;
alter table articles add column if not exists imported_at timestamptz;
alter table articles add column if not exists tags text[] default '{}';
alter table articles add column if not exists image_url text;
alter table articles add column if not exists cover_image_url text;
alter table articles add column if not exists excerpt text;
alter table articles add column if not exists category text default 'Local News';
alter table articles add column if not exists published_at timestamptz;
alter table articles add column if not exists status text default 'draft';

create unique index if not exists articles_wordpress_id_unique
on articles (wordpress_id)
where wordpress_id is not null;

create index if not exists articles_status_published_at_idx on articles (status, published_at desc);
create index if not exists articles_category_idx on articles (category);
create index if not exists articles_slug_idx on articles (slug);

-- normalize a few old imported rows
update articles set body = replace(body, '<p class="">', '<p>') where body like '%<p class="">%';
update articles set body = replace(body, '&nbsp;', ' ') where body like '%&nbsp;%';
update articles set category = 'Local News' where category is null or length(trim(category)) = 0;
update articles set status = 'published' where status is null and published_at is not null;
