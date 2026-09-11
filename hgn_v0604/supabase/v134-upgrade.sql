-- HGN v134 - Online Beta Final Sweep
-- Focus: final public upload checklist, smoke tests, and launch-day confidence for the two-person admin/editor beta.

create table if not exists online_beta_final_sweep_items (
  id uuid primary key default gen_random_uuid(),
  item_title text not null,
  item_group text not null default 'final sweep',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists online_beta_public_smoke_tests (
  id uuid primary key default gen_random_uuid(),
  route_path text not null,
  route_label text not null,
  status text not null default 'review',
  severity text not null default 'medium',
  expected_result text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists online_beta_final_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text not null default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_online_beta_final_sweep_status on online_beta_final_sweep_items(status);
create index if not exists idx_online_beta_final_sweep_group on online_beta_final_sweep_items(item_group);
create index if not exists idx_online_beta_public_smoke_tests_status on online_beta_public_smoke_tests(status);

insert into online_beta_final_sweep_items (item_title, item_group, status, severity, notes, sort_order)
values
  ('Freeze feature work after this package', 'feature freeze', 'review', 'critical', 'Only fix blockers, copy mistakes, build errors and public launch issues after v134.', 10),
  ('Run npm install and production build locally', 'build', 'review', 'critical', 'Confirm the exact package builds outside this artifact environment before upload.', 20),
  ('Apply SQL through v134 in order', 'database', 'review', 'critical', 'Run the remaining migrations and confirm the v134 tables exist.', 30),
  ('Confirm production environment variables', 'deployment', 'review', 'critical', 'Check Supabase URL, anon key, site URL, storage and any newsletter or analytics settings.', 40),
  ('Publish one real beta article end to end', 'workflow', 'review', 'critical', 'Create, edit, add image metadata, publish, feature on homepage and view on mobile.', 50),
  ('Do a phone-first homepage pass', 'mobile', 'review', 'high', 'Open the homepage from a phone and check hero story, menus, spacing, images and scroll depth.', 60),
  ('Hide unfinished public navigation', 'cleanup', 'review', 'high', 'Routes can exist, but unfinished surfaces should not be promoted in public nav during soft beta.', 70),
  ('Record rollback and emergency contacts', 'safety', 'review', 'high', 'Know how to revert deploy, hide a page, and contact the editor/admin quickly.', 80)
on conflict do nothing;

insert into online_beta_public_smoke_tests (route_path, route_label, status, severity, expected_result, sort_order)
values
  ('/', 'Homepage', 'review', 'critical', 'Loads fast enough, shows current local stories, and looks credible on mobile.', 10),
  ('/articles', 'Article index', 'review', 'high', 'Stories are findable and article cards do not look broken or empty.', 20),
  ('/newsletter', 'Newsletter signup', 'review', 'medium', 'Signup path is visible without overpromising launch volume.', 30),
  ('/trust', 'Trust page', 'review', 'medium', 'Correction and transparency links are clear enough for beta readers.', 40),
  ('/contact', 'Contact page', 'review', 'medium', 'Readers can reach HGN without confusion.', 50),
  ('/emergency', 'Emergency page', 'review', 'high', 'Emergency information page is not stale or misleading.', 60),
  ('/weather', 'Weather utility', 'review', 'medium', 'Utility page loads and does not block the homepage experience.', 70),
  ('/sitemap.xml', 'Sitemap', 'review', 'high', 'Discovery file is reachable after deployment.', 80),
  ('/rss.xml', 'RSS', 'review', 'high', 'RSS feed is reachable after deployment.', 90)
on conflict do nothing;

insert into online_beta_final_notes (note_title, note_body, status, owner)
values ('v134 final sweep note', 'This is a launch-facing sweep. Treat HGN as close to online beta: freeze features, fix blockers, run a real publish test, smoke test public routes from a phone, then upload when the critical checks are clear.', 'open', 'Admin / Editor')
on conflict do nothing;
