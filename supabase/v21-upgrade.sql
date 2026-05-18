-- HGN v21 WordPress import readiness
alter table articles add column if not exists wordpress_id text;
alter table articles add column if not exists original_url text;
alter table articles add column if not exists imported_from text;
alter table articles add column if not exists imported_at timestamptz;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists cover_image_url text;
alter table articles add column if not exists tags text[] default '{}';
alter table articles add column if not exists published_at timestamptz;
alter table articles add column if not exists excerpt text;
alter table articles add column if not exists author_name text;
alter table articles add column if not exists category text default 'Local News';
alter table articles add column if not exists body text;
alter table articles add column if not exists slug text;
alter table articles add column if not exists status text default 'draft';
create unique index if not exists articles_wordpress_id_unique_idx on articles (wordpress_id) where wordpress_id is not null;
create unique index if not exists articles_slug_unique_idx on articles (slug) where slug is not null;
