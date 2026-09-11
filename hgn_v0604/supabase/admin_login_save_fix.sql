-- PuckScope admin login + GM account save fix
-- Safe to run even if you already ran the older account SQL.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  favorite_team text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gm_tool_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('mock_draft', 'draft_board', 'my_prospects', 'scouting_clipboard')),
  title text not null default 'Default',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gm_tool_saves_user_kind_title_unique
  on public.gm_tool_saves(user_id, kind, title);

create index if not exists gm_tool_saves_user_kind_idx
  on public.gm_tool_saves(user_id, kind, updated_at desc);

alter table public.profiles enable row level security;
alter table public.gm_tool_saves enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Profiles are viewable by owner') then
    create policy "Profiles are viewable by owner" on public.profiles for select using (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Profiles are insertable by owner') then
    create policy "Profiles are insertable by owner" on public.profiles for insert with check (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Profiles are updateable by owner') then
    create policy "Profiles are updateable by owner" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='gm_tool_saves' and policyname='GM saves are viewable by owner') then
    create policy "GM saves are viewable by owner" on public.gm_tool_saves for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='gm_tool_saves' and policyname='GM saves are insertable by owner') then
    create policy "GM saves are insertable by owner" on public.gm_tool_saves for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='gm_tool_saves' and policyname='GM saves are updateable by owner') then
    create policy "GM saves are updateable by owner" on public.gm_tool_saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='gm_tool_saves' and policyname='GM saves are deletable by owner') then
    create policy "GM saves are deletable by owner" on public.gm_tool_saves for delete using (auth.uid() = user_id);
  end if;
end $$;
