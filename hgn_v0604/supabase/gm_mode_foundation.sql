-- Draft Room / Prospect Tracker foundation
-- Run this in Supabase SQL Editor before using the new category boards and claim-profile fields.

alter table public.players
  add column if not exists draft_year text,
  add column if not exists nhl_team text,
  add column if not exists player_status text default 'active',
  add column if not exists ranking_bucket text;

alter table public.prospect_submissions
  add column if not exists shoots text,
  add column if not exists height text,
  add column if not exists weight text,
  add column if not exists nhl_team text,
  add column if not exists draft_year text,
  add column if not exists highlights_url text,
  add column if not exists measurable_data text,
  add column if not exists achievements text,
  add column if not exists verification_status text default 'pending',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewer_notes text;

create table if not exists public.scouting_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  player_name text,
  tag text default 'Watch',
  skating int,
  shot int,
  hockey_iq int,
  compete int,
  upside int,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.team_pipeline_rankings (
  id uuid primary key default gen_random_uuid(),
  nhl_team text not null,
  rank int,
  summary text,
  strengths text,
  needs text,
  ranking_date date default current_date,
  created_at timestamptz default now()
);

create table if not exists public.ranking_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into public.ranking_categories (slug, title, description)
values
  ('2027-draft', '2027 NHL Draft Rankings', 'Early rankings and watch list for the 2027 NHL Draft.'),
  ('goalies', 'Goalie Prospect Rankings', 'Draft eligible and drafted goalie prospects.'),
  ('chl', 'CHL Prospect Rankings', 'WHL, OHL, and QMJHL prospect rankings.'),
  ('ncaa', 'NCAA Prospect Rankings', 'College prospect rankings and watch list.'),
  ('team-pipelines', 'NHL Team Pipeline Rankings', 'Organization prospect pipeline rankings.')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description;

create index if not exists players_draft_year_idx on public.players(draft_year);
create index if not exists players_nhl_team_idx on public.players(nhl_team);
create index if not exists players_position_idx on public.players(position);
create index if not exists prospect_submissions_status_idx on public.prospect_submissions(verification_status);
