-- HGN v32 editor upgrade
-- Adds columns and storage policies needed for the WordPress-style article editor.

alter table articles add column if not exists section text;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists sort_order integer default 0;
alter table articles add column if not exists status text default 'draft';
alter table articles add column if not exists excerpt text;
alter table articles add column if not exists author_name text;
alter table articles add column if not exists published_at timestamptz;
alter table articles add column if not exists created_at timestamptz default now();
alter table articles add column if not exists updated_at timestamptz default now();

create unique index if not exists articles_slug_unique on articles(slug);

update articles set section = category where section is null and category is not null;
update articles set status = 'published' where status is null;
update articles set author_name = 'Haida Gwaii News' where author_name is null or trim(author_name) = '';

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = true;

-- Storage policies are intentionally simple for local/demo use.
-- Tighten these before full public production if needed.
drop policy if exists "Article images are publicly readable" on storage.objects;
drop policy if exists "Authenticated users can upload article images" on storage.objects;
drop policy if exists "Authenticated users can update article images" on storage.objects;
drop policy if exists "Authenticated users can delete article images" on storage.objects;

create policy "Article images are publicly readable"
on storage.objects for select
using (bucket_id = 'article-images');

create policy "Authenticated users can upload article images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'article-images');

create policy "Authenticated users can update article images"
on storage.objects for update
to authenticated
using (bucket_id = 'article-images')
with check (bucket_id = 'article-images');

create policy "Authenticated users can delete article images"
on storage.objects for delete
to authenticated
using (bucket_id = 'article-images');
