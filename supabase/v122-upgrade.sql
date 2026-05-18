-- HGN v122 - Simple Admin Home
-- Consolidates the admin entry point for a two-person admin/editor beta.

create table if not exists public.simple_admin_home_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  href text not null,
  card_group text not null default 'primary',
  card_status text not null default 'active',
  description text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simple_admin_home_notes (
  id uuid primary key default gen_random_uuid(),
  note text not null,
  note_type text not null default 'cleanup',
  owner text not null default 'Admin / Editor',
  created_at timestamptz not null default now()
);

create index if not exists simple_admin_home_cards_group_idx on public.simple_admin_home_cards(card_group);
create index if not exists simple_admin_home_cards_status_idx on public.simple_admin_home_cards(card_status);
create unique index if not exists simple_admin_home_cards_href_key on public.simple_admin_home_cards(href);

insert into public.simple_admin_home_cards (title, href, card_group, card_status, description, sort_order)
values
  ('Newsroom Hub', '/admin/newsroom-hub', 'primary', 'active', 'Start here for the daily admin/editor workflow.', 10),
  ('Core Workflow', '/admin/core-workflow', 'primary', 'active', 'The preferred publishing rhythm for soft beta.', 20),
  ('Articles', '/admin/articles', 'primary', 'active', 'Create, edit, review and publish stories.', 30),
  ('Homepage Control', '/admin/homepage-control', 'primary', 'active', 'Manage the front page without opening multiple dashboards.', 40),
  ('Media', '/admin/media', 'primary', 'active', 'Upload and clean up photos, captions, credits and alt text.', 50),
  ('Ship Check', '/admin/ship-check', 'primary', 'active', 'Final daily check before calling the site ready.', 60),
  ('Launch Cleanup', '/admin/launch-cleanup', 'cleanup', 'active', 'Park duplicate tools and keep the admin path clean.', 70),
  ('Admin Map', '/admin/admin-map', 'cleanup', 'active', 'Decide what is primary, occasional, parked or hidden.', 80),
  ('Live Desk', '/admin/live-desk', 'occasional', 'active', 'Use only when a live or urgent update is happening.', 110),
  ('Newsletter Desk', '/admin/newsletter-desk', 'occasional', 'active', 'Use when planning or sending newsletter editions.', 120),
  ('Emergency Desk', '/admin/emergency-desk', 'occasional', 'active', 'Use for public safety updates and urgent community notices.', 130),
  ('Older Mini Desks', '/admin', 'parked', 'review', 'Keep available, but do not make them the daily path.', 900)
on conflict (href) do update set
  title = excluded.title,
  card_group = excluded.card_group,
  card_status = excluded.card_status,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.simple_admin_home_notes (note, note_type, owner)
values ('v122 simplifies the admin home so the two-person beta has one clear starting point and fewer dashboard hops.', 'release-note', 'Admin / Editor')
on conflict do nothing;
