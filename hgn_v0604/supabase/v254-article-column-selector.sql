-- HGN v254 - Article Column Selector
-- Safe to rerun.

alter table public.articles add column if not exists column_name text;
alter table public.articles add column if not exists column_slug text;
alter table public.articles add column if not exists columnist_name text;
alter table public.articles add column if not exists columnist_id uuid;

create index if not exists idx_articles_column_slug on public.articles (column_slug);
create index if not exists idx_articles_column_name on public.articles (column_name);

notify pgrst, 'reload schema';
