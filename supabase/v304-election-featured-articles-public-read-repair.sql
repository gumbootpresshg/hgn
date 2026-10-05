-- HGN v0.67.9 - Repair public read access for selected Election Guide articles.
-- This exposes only article IDs already selected by the publisher. Article visibility
-- remains governed by the existing public articles policy and the public page still
-- filters to status = 'published'.

alter table public.hgn_election_article_features enable row level security;

drop policy if exists "Election article features public read" on public.hgn_election_article_features;
create policy "Election article features public read"
  on public.hgn_election_article_features
  for select
  using (true);
