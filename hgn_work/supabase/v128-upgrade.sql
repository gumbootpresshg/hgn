-- HGN v128 - Production Polish Sprint
-- Focus: final online beta polish, route confidence, mobile/frontend readiness.

create table if not exists production_polish_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'general',
  status text not null default 'review',
  priority text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists production_route_reviews (
  id uuid primary key default gen_random_uuid(),
  route_path text not null unique,
  route_label text not null,
  status text not null default 'review',
  device_focus text not null default 'desktop and mobile',
  notes text,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists production_soft_beta_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text not null default 'open',
  created_by text default 'Admin / Editor',
  created_at timestamptz not null default now()
);

create index if not exists production_polish_checks_status_idx on production_polish_checks(status);
create index if not exists production_polish_checks_area_idx on production_polish_checks(area);
create index if not exists production_route_reviews_status_idx on production_route_reviews(status);

insert into production_polish_checks (title, area, status, priority, owner, notes, sort_order)
values
  ('Homepage first impression pass', 'frontend', 'review', 'high', 'Admin / Editor', 'Check hero, local utility blocks, story hierarchy, spacing and obvious stale items.', 10),
  ('Article reading experience pass', 'frontend', 'review', 'high', 'Admin / Editor', 'Check headline, byline, image, caption, body width, related links and mobile readability.', 20),
  ('Mobile navigation pass', 'mobile', 'review', 'high', 'Admin / Editor', 'Verify menu, touch targets, spacing and scrolling on phone before online beta.', 30),
  ('Production environment check', 'deployment', 'review', 'high', 'Admin', 'Confirm Supabase project keys, site URL, metadata, redirects and production-only settings.', 40),
  ('Search and discovery check', 'seo', 'review', 'medium', 'Admin / Editor', 'Confirm sitemap, RSS, canonical URLs, article metadata and basic crawl paths.', 50),
  ('Hide unfinished public surfaces', 'cleanup', 'review', 'high', 'Admin', 'Any experimental route that is not ready should be hidden from primary navigation.', 60)
on conflict do nothing;

insert into production_route_reviews (route_path, route_label, status, device_focus, notes, sort_order)
values
  ('/', 'Homepage', 'review', 'desktop and mobile', 'Must feel fresh, local and trustworthy.', 10),
  ('/articles', 'Article index', 'review', 'desktop and mobile', 'Check story cards, empty states and section hierarchy.', 20),
  ('/admin/simple-home', 'Simple admin home', 'review', 'desktop', 'Should be the clean two-person starting point.', 30),
  ('/admin/newsroom-hub', 'Newsroom hub', 'review', 'desktop', 'Should consolidate instead of adding confusion.', 40),
  ('/beta-ready', 'Beta ready status', 'review', 'desktop and mobile', 'Use as a simple launch confidence page.', 50),
  ('/live-updates', 'Live updates', 'review', 'desktop and mobile', 'Should not look empty or broken if no live item is active.', 60)
on conflict (route_path) do nothing;

insert into production_soft_beta_notes (note_title, note_body, status, created_by)
values
  ('Soft beta upload rule', 'Do not add another workflow desk until homepage, article page, mobile nav and production env checks have been reviewed.', 'open', 'Admin / Editor')
on conflict do nothing;
