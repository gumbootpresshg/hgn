-- HGN v0.51.7: one-click SEO and Google News fields
-- Safe additive migration. Run after v269.

alter table public.articles add column if not exists seo_keywords text[] default '{}'::text[];
alter table public.articles add column if not exists google_news_headline text;
alter table public.articles add column if not exists seo_generated_at timestamptz;
alter table public.articles add column if not exists google_news_include boolean default true;
alter table public.articles add column if not exists social_title text;
alter table public.articles add column if not exists social_description text;
alter table public.articles add column if not exists og_image_url text;
alter table public.articles add column if not exists canonical_url text;

update public.articles
set google_news_include = true
where google_news_include is null;

create index if not exists articles_google_news_recent_idx
  on public.articles (status, google_news_include, published_at desc);
