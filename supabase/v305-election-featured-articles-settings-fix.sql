-- HGN v0.67.11 - Store the public Election Guide article choices with the
-- other public guide settings. This avoids a separate public feature-table
-- read while preserving the existing feature table for compatibility.

alter table public.hgn_election_settings
  add column if not exists featured_article_ids uuid[] not null default '{}'::uuid[];

update public.hgn_election_settings settings
set featured_article_ids = coalesce(featured.ids, '{}'::uuid[])
from (
  select coalesce(array_agg(article_id order by sort_order), '{}'::uuid[]) as ids
  from public.hgn_election_article_features
) featured
where settings.id = 'current'
  and cardinality(settings.featured_article_ids) = 0;
