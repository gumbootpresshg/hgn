-- HGN Pumpkin Carve-Off: public entries are reviewed before publication.
create table if not exists public.hgn_pumpkin_contests (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null default 'The Great Haida Gwaii Pumpkin Carve-Off',
  intro text not null default 'Show us your best pumpkin creation, then help choose the island favourites.',
  rules text not null default 'One entry per household. By submitting, you confirm that HGN may display the photo for this competition.',
  entry_open_at timestamptz, entry_close_at timestamptz, voting_open_at timestamptz, voting_close_at timestamptz,
  max_votes_per_voter integer not null default 5 check (max_votes_per_voter between 1 and 10),
  show_leaderboard boolean not null default true, leaderboard_size integer not null default 5 check (leaderboard_size between 1 and 20),
  status text not null default 'draft' check (status in ('draft','entries','voting','results','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.hgn_pumpkin_entries (
  id uuid primary key default gen_random_uuid(), contest_id uuid not null references public.hgn_pumpkin_contests(id) on delete cascade,
  display_name text not null, community text, title text, description text, photo_url text not null,
  contact_email text not null, contact_phone text, status text not null default 'pending' check (status in ('pending','approved','rejected')),
  featured boolean not null default false, created_at timestamptz not null default now(), reviewed_at timestamptz
);
create table if not exists public.hgn_pumpkin_ballots (
  id uuid primary key default gen_random_uuid(), contest_id uuid not null references public.hgn_pumpkin_contests(id) on delete cascade,
  voter_name text, voter_email text not null, verification_code text, verification_expires_at timestamptz,
  verified_at timestamptz, pending_entry_ids jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (contest_id, voter_email)
);
create table if not exists public.hgn_pumpkin_votes (
  id uuid primary key default gen_random_uuid(), ballot_id uuid not null references public.hgn_pumpkin_ballots(id) on delete cascade,
  entry_id uuid not null references public.hgn_pumpkin_entries(id) on delete cascade, created_at timestamptz not null default now(), unique(ballot_id, entry_id)
);
create index if not exists hgn_pumpkin_entries_contest_status_idx on public.hgn_pumpkin_entries(contest_id,status,featured,created_at desc);
create index if not exists hgn_pumpkin_votes_entry_idx on public.hgn_pumpkin_votes(entry_id);
insert into public.hgn_pumpkin_contests (slug,title,status,entry_open_at,entry_close_at,voting_open_at,voting_close_at)
select 'pumpkin-carve-off-2026','The Great Haida Gwaii Pumpkin Carve-Off','entries','2026-10-01 00:00 America/Vancouver','2026-11-01 00:00 America/Vancouver','2026-11-01 00:00 America/Vancouver','2026-11-03 00:00 America/Vancouver'
where not exists (select 1 from public.hgn_pumpkin_contests where slug='pumpkin-carve-off-2026');
alter table public.hgn_pumpkin_contests enable row level security;
alter table public.hgn_pumpkin_entries enable row level security;
alter table public.hgn_pumpkin_ballots enable row level security;
alter table public.hgn_pumpkin_votes enable row level security;
-- All public interaction goes through server routes; publisher tools use the service role.
