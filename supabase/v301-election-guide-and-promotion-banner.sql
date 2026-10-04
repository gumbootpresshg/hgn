-- HGN v0.67.4 - Editorial promotion banner and editable election guide.
-- Public HGN only: this contains public-facing editorial configuration, never
-- advertiser CRM, billing, private voter data, or question submissions.

alter table public.front_page_settings
  add column if not exists promotion_is_active boolean not null default false,
  add column if not exists promotion_eyebrow text,
  add column if not exists promotion_title text,
  add column if not exists promotion_description text,
  add column if not exists promotion_button_text text,
  add column if not exists promotion_url text,
  add column if not exists promotion_image_url text,
  add column if not exists promotion_style text not null default 'navy',
  add column if not exists promotion_starts_at timestamptz,
  add column if not exists promotion_expires_at timestamptz;

create table if not exists public.hgn_election_settings (
  id text primary key default 'current',
  eyebrow text not null default '2026 local election',
  title text not null default 'Haida Gwaii Election Guide',
  introduction text not null default 'Candidates, debates, local news and the information you need before voting.',
  voting_day_label text not null default 'Voting day',
  voting_day_value text not null default 'Saturday, Oct. 17, 2026',
  question_url text,
  question_label text not null default 'Submit a question',
  official_voting_url text,
  official_voting_label text not null default 'Official voting information',
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.hgn_election_settings (id, question_url, question_label)
values ('current', 'https://forms.gle/3HfnM7kNYF4nZ2168', 'Submit a question')
on conflict (id) do update set
  question_url = coalesce(public.hgn_election_settings.question_url, excluded.question_url),
  question_label = coalesce(nullif(public.hgn_election_settings.question_label, ''), excluded.question_label);

create table if not exists public.hgn_election_debates (
  id uuid primary key default gen_random_uuid(),
  day_label text not null,
  event_date timestamptz,
  school_title text not null default 'School Trustee Debate',
  school_url text,
  school_status text not null default 'upcoming' check (school_status in ('upcoming','live','replay','hidden')),
  municipal_title text not null default 'Municipal Debate',
  municipal_url text,
  municipal_status text not null default 'upcoming' check (municipal_status in ('upcoming','live','replay','hidden')),
  venue_note text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hgn_election_debates_public_order_idx on public.hgn_election_debates (published, sort_order, event_date);

-- The organizer has confirmed three days of trustee and municipal forums.
-- Dates and YouTube links remain deliberately editable rather than guessed.
insert into public.hgn_election_debates (day_label, school_title, municipal_title, venue_note, sort_order)
select seed.day_label, 'School Trustee Debate', 'Municipal Debate', 'Trustee forum 5:30 p.m. · Municipal forum 7 p.m.', seed.sort_order
from (values ('Day one', 1), ('Day two', 2), ('Day three', 3)) as seed(day_label, sort_order)
where not exists (select 1 from public.hgn_election_debates existing where existing.day_label = seed.day_label);

create table if not exists public.hgn_election_article_features (
  article_id uuid primary key references public.articles(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists hgn_election_article_features_order_idx on public.hgn_election_article_features (sort_order);

-- Start the guide with HGN's existing ballot overview when that published story exists.
insert into public.hgn_election_article_features (article_id, sort_order)
select id, 1 from public.articles
where slug = 'who-s-on-the-ballot-haida-gwaii-s-2026-local-election-at-a-glance-58727'
on conflict (article_id) do nothing;

create table if not exists public.hgn_election_races (
  id uuid primary key default gen_random_uuid(),
  group_name text not null default 'Municipal races',
  place text not null,
  office text not null,
  seats text,
  ballot_status text not null default 'vote' check (ballot_status in ('vote','acclaimed','information')),
  candidates text[] not null default '{}'::text[],
  note text,
  official_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hgn_election_races_public_order_idx on public.hgn_election_races (published, group_name, sort_order);

alter table public.hgn_election_settings enable row level security;
alter table public.hgn_election_debates enable row level security;
alter table public.hgn_election_article_features enable row level security;
alter table public.hgn_election_races enable row level security;

drop policy if exists "Election settings public read" on public.hgn_election_settings;
create policy "Election settings public read" on public.hgn_election_settings for select using (is_published = true);
drop policy if exists "Election debates public read" on public.hgn_election_debates;
create policy "Election debates public read" on public.hgn_election_debates for select using (published = true);
drop policy if exists "Election article features public read" on public.hgn_election_article_features;
create policy "Election article features public read" on public.hgn_election_article_features for select using (true);
drop policy if exists "Election races public read" on public.hgn_election_races;
create policy "Election races public read" on public.hgn_election_races for select using (published = true);

drop policy if exists "Election settings publisher write" on public.hgn_election_settings;
create policy "Election settings publisher write" on public.hgn_election_settings for all using (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
) with check (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
);
drop policy if exists "Election debates publisher write" on public.hgn_election_debates;
create policy "Election debates publisher write" on public.hgn_election_debates for all using (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
) with check (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
);
drop policy if exists "Election article features publisher write" on public.hgn_election_article_features;
create policy "Election article features publisher write" on public.hgn_election_article_features for all using (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
) with check (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
);
drop policy if exists "Election races publisher write" on public.hgn_election_races;
create policy "Election races publisher write" on public.hgn_election_races for all using (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
) with check (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
);
