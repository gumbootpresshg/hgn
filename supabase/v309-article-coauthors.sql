-- HGN v0.67.40 - support genuine multi-author credits.
create table if not exists public.hgn_article_authors (
  article_id uuid not null references public.articles(id) on delete cascade,
  author_id uuid not null references public.hgn_authors(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (article_id, author_id)
);

create index if not exists idx_hgn_article_authors_author on public.hgn_article_authors(author_id, article_id);

alter table public.hgn_article_authors enable row level security;
drop policy if exists "hgn_article_authors_public_read" on public.hgn_article_authors;
create policy "hgn_article_authors_public_read" on public.hgn_article_authors for select to anon, authenticated using (true);

-- Correct the archived Suzuki/Hanington shared credit without rewriting its byline text.
insert into public.hgn_article_authors (article_id, author_id, sort_order)
select a.id, w.id, case when w.slug = 'david-suzuki' then 10 else 20 end
from public.articles a
join public.hgn_authors w on w.slug in ('david-suzuki', 'ian-hanington')
where lower(coalesce(a.author_name, a.author, '')) like '%david suzuki%'
  and lower(coalesce(a.author_name, a.author, '')) like '%ian hanington%'
on conflict (article_id, author_id) do update set sort_order = excluded.sort_order;
