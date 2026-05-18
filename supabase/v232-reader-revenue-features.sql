-- HGN v232 - Reader + Revenue Features
-- Safe to rerun.

create extension if not exists pgcrypto;

-- Verified Marketplace sellers
create table if not exists public.marketplace_sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  display_name text,
  is_verified boolean default false,
  verified_by uuid,
  verified_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.marketplace_sellers enable row level security;

create unique index if not exists idx_marketplace_sellers_user_id
on public.marketplace_sellers (user_id);

drop policy if exists "marketplace_sellers_owner_read" on public.marketplace_sellers;
create policy "marketplace_sellers_owner_read"
on public.marketplace_sellers
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "marketplace_sellers_authenticated_manage" on public.marketplace_sellers;
create policy "marketplace_sellers_authenticated_manage"
on public.marketplace_sellers
for all
to authenticated
using (true)
with check (true);

-- Polls
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  description text,
  status text default 'draft',
  starts_at timestamptz default now(),
  ends_at timestamptz,
  show_on_home boolean default false,
  allow_multiple boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) on delete cascade,
  label text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) on delete cascade,
  option_id uuid references public.poll_options(id) on delete cascade,
  voter_hash text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

drop policy if exists "polls_public_read_active" on public.polls;
create policy "polls_public_read_active"
on public.polls
for select
to anon, authenticated
using (status in ('published','active','live') and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));

drop policy if exists "poll_options_public_read" on public.poll_options;
create policy "poll_options_public_read"
on public.poll_options
for select
to anon, authenticated
using (exists (select 1 from public.polls p where p.id = poll_options.poll_id and p.status in ('published','active','live')));

drop policy if exists "poll_votes_public_insert" on public.poll_votes;
create policy "poll_votes_public_insert"
on public.poll_votes
for insert
to anon, authenticated
with check (true);

drop policy if exists "polls_authenticated_manage" on public.polls;
create policy "polls_authenticated_manage"
on public.polls
for all
to authenticated
using (true)
with check (true);

drop policy if exists "poll_options_authenticated_manage" on public.poll_options;
create policy "poll_options_authenticated_manage"
on public.poll_options
for all
to authenticated
using (true)
with check (true);

-- Newsletter drafts
create table if not exists public.newsletter_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text,
  intro text,
  date_from date,
  date_to date,
  article_ids uuid[] default '{}',
  status text default 'draft',
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.newsletter_drafts enable row level security;

drop policy if exists "newsletter_authenticated_manage" on public.newsletter_drafts;
create policy "newsletter_authenticated_manage"
on public.newsletter_drafts
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_polls_home_status on public.polls (show_on_home, status, starts_at, ends_at);
create index if not exists idx_poll_options_poll_sort on public.poll_options (poll_id, sort_order);
create index if not exists idx_poll_votes_poll_option on public.poll_votes (poll_id, option_id);

notify pgrst, 'reload schema';
