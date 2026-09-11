-- PuckScope Admin Control Room foundation
-- Run this in Supabase SQL Editor after gm_mode_foundation.sql.

alter table public.articles
  add column if not exists is_featured boolean default false,
  add column if not exists featured_rank int,
  add column if not exists editor_note text;

alter table public.players
  add column if not exists is_featured boolean default false,
  add column if not exists admin_note text;

alter table public.prospect_submissions
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewer_notes text;

create index if not exists articles_featured_idx on public.articles(is_featured, featured_rank);
create index if not exists players_featured_idx on public.players(is_featured);
create index if not exists players_ranking_bucket_idx on public.players(ranking_bucket);
