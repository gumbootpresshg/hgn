-- HGN v0.67.19 - Public puzzle editions and publisher controls.
create table if not exists public.hgn_games (
  id uuid primary key default gen_random_uuid(),
  game_type text not null check (game_type in ('crossword','wordsearch','sudoku')),
  title text not null,
  difficulty text not null default 'medium',
  instructions text,
  payload jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hgn_games_public_idx on public.hgn_games (published, published_at desc, created_at desc);
alter table public.hgn_games enable row level security;
drop policy if exists "Games public read" on public.hgn_games;
create policy "Games public read" on public.hgn_games for select using (published = true);
drop policy if exists "Games publisher write" on public.hgn_games;
create policy "Games publisher write" on public.hgn_games for all using (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
) with check (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
);
