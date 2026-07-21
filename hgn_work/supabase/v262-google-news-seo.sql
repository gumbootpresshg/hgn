-- HGN Google News / SEO support columns
-- Safe to run more than once.

alter table if exists public.articles
  add column if not exists seo_title text,
  add column if not exists meta_description text,
  add column if not exists og_image_url text,
  add column if not exists image_alt text,
  add column if not exists image_caption text,
  add column if not exists image_credit text,
  add column if not exists updated_at timestamptz;

-- Keep updated_at useful for SEO / NewsArticle dateModified.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

create index if not exists articles_published_slug_idx on public.articles (status, published_at desc, slug);
create index if not exists articles_category_idx on public.articles (category);
create index if not exists articles_subcategory_idx on public.articles (subcategory);
