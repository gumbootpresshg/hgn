-- HGN v131 - Public Polish Overhaul
-- Focus: soft-beta public presentation, article trust checks, mobile first impression, and launch upload confidence.

create table if not exists public_polish_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'public polish',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public_polish_routes (
  id uuid primary key default gen_random_uuid(),
  route_path text not null unique,
  route_label text not null,
  route_group text not null default 'public route',
  status text not null default 'review',
  severity text not null default 'medium',
  expected_result text,
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public_polish_article_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text not null default 'article page',
  status text not null default 'review',
  severity text not null default 'medium',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public_polish_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text not null default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_public_polish_checks_status on public_polish_checks(status);
create index if not exists idx_public_polish_routes_status on public_polish_routes(status);
create index if not exists idx_public_polish_article_checks_status on public_polish_article_checks(status);

insert into public_polish_checks (title, area, status, severity, notes, sort_order)
values
  ('Homepage feels alive on first visit', 'homepage', 'review', 'critical', 'Check the hero story, image strength, local signal, utility widgets and freshness above the fold.', 10),
  ('Mobile homepage scan passes', 'mobile', 'review', 'critical', 'Open the site on a phone and confirm spacing, cards, nav and story hierarchy feel clean.', 20),
  ('Article page trust pass', 'articles', 'review', 'high', 'Confirm byline, date, image credit, caption, related links and share metadata look credible.', 30),
  ('Unfinished public routes hidden or clearly safe', 'route cleanup', 'review', 'high', 'Do not send beta visitors into experimental pages that feel incomplete.', 40),
  ('Soft beta feedback path visible', 'feedback', 'review', 'medium', 'Make sure testers can quickly report a problem without hunting through admin pages.', 50)
on conflict do nothing;

insert into public_polish_routes (route_path, route_label, route_group, status, severity, expected_result, sort_order)
values
  ('/', 'Homepage', 'core public', 'review', 'critical', 'Clear local front page with current lead story and no broken sections.', 10),
  ('/articles', 'Articles index', 'core public', 'review', 'high', 'Recent stories are easy to scan and open.', 20),
  ('/community-board', 'Community board', 'community', 'review', 'medium', 'Useful but not cluttered; any empty states feel intentional.', 30),
  ('/events', 'Events', 'community', 'review', 'medium', 'Events page does not look abandoned if there are few listings.', 40),
  ('/contact', 'Contact', 'trust', 'review', 'high', 'A reader can quickly find how to reach HGN.', 50),
  ('/corrections', 'Corrections', 'trust', 'review', 'medium', 'Trust/corrections route feels credible and not overbuilt.', 60)
on conflict (route_path) do nothing;

insert into public_polish_article_checks (check_title, check_group, status, severity, notes, sort_order)
values
  ('Headline and deck read cleanly on mobile', 'article presentation', 'review', 'high', 'Avoid cramped headline wrapping and oversized metadata.', 10),
  ('Featured image has caption, credit and alt text', 'media trust', 'review', 'critical', 'This is one of the biggest credibility checks for a local publication.', 20),
  ('SEO title and description are present', 'discovery', 'review', 'high', 'Required before relying on search/social sharing.', 30),
  ('Story body typography is readable', 'mobile reading', 'review', 'critical', 'Check line length, spacing, font size and paragraph rhythm.', 40),
  ('Related actions are not distracting', 'reader flow', 'review', 'medium', 'Newsletter, share and support prompts should not overwhelm the article.', 50)
on conflict do nothing;

insert into public_polish_notes (note_title, note_body, status, owner)
values ('Soft beta public polish note', 'Before uploading online, treat the homepage and article page as the product. If those two feel credible on mobile, the beta is close.', 'open', 'Admin / Editor')
on conflict do nothing;
