-- HGN v17: tighten working flows before WordPress import

-- Keep article schema tolerant across old/new builds
alter table articles add column if not exists status text default 'draft';
alter table articles add column if not exists excerpt text;
alter table articles add column if not exists category text;
alter table articles add column if not exists author_name text;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists published_at timestamptz;
alter table articles add column if not exists slug text;
alter table articles add column if not exists body text;
create unique index if not exists articles_slug_idx on articles (slug) where slug is not null;

-- Reader/contributor working queues
create table if not exists story_tips (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  town text,
  title text not null,
  details text not null,
  status text default 'new',
  assigned_to text,
  created_at timestamptz default now()
);

create table if not exists photo_submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  caption text,
  photo_url text,
  status text default 'new',
  created_at timestamptz default now()
);

alter table classifieds add column if not exists location text;
alter table classifieds add column if not exists image_url text;
alter table classifieds add column if not exists status text default 'pending';
alter table community_events add column if not exists status text default 'pending';
alter table live_map_items add column if not exists lat double precision;
alter table live_map_items add column if not exists lng double precision;
alter table live_map_items add column if not exists status text default 'pending';

-- Make public submission flows work and admin flows readable.
alter table story_tips enable row level security;
alter table photo_submissions enable row level security;

drop policy if exists "Public can create story tips" on story_tips;
create policy "Public can create story tips" on story_tips for insert with check (true);
drop policy if exists "Authenticated can manage story tips" on story_tips;
create policy "Authenticated can manage story tips" on story_tips for all to authenticated using (true) with check (true);

drop policy if exists "Public can create photos" on photo_submissions;
create policy "Public can create photos" on photo_submissions for insert with check (true);
drop policy if exists "Authenticated can manage photos" on photo_submissions;
create policy "Authenticated can manage photos" on photo_submissions for all to authenticated using (true) with check (true);

-- Storage bucket for reader uploads. Public bucket is easiest for newspaper/community submissions.
insert into storage.buckets (id, name, public)
values ('hgn-media', 'hgn-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can upload hgn media" on storage.objects;
create policy "Public can upload hgn media"
on storage.objects for insert
with check (bucket_id = 'hgn-media');

drop policy if exists "Public can read hgn media" on storage.objects;
create policy "Public can read hgn media"
on storage.objects for select
using (bucket_id = 'hgn-media');

-- Helpful starter published article if the site is empty.
insert into articles (title, slug, category, author_name, excerpt, body, status, published_at, featured)
select 'Welcome to the New Haida Gwaii News Digital Front Page', 'welcome-to-new-hgn-digital-front-page', 'Local News', 'Haida Gwaii News',
'Before the WordPress import, this starter story confirms the article system is working.',
'This starter article can be deleted once the WordPress archive is imported. It confirms that published stories, article pages, the scroll-first front page, and editor publishing are connected.',
'published', now(), true
where not exists (select 1 from articles where slug = 'welcome-to-new-hgn-digital-front-page');
