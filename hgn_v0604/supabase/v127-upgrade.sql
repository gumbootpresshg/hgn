-- HGN v127 Soft Beta Launch Cockpit
-- Consolidates final launch readiness for a two-person admin/editor beta.

create table if not exists soft_beta_readiness_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'review',
  owner text default 'Admin / Editor',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists soft_beta_go_live_tasks (
  id uuid primary key default gen_random_uuid(),
  task_title text not null,
  description text,
  task_status text not null default 'review',
  owner text default 'Admin / Editor',
  sort_order integer not null default 100,
  due_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists soft_beta_public_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  description text,
  check_status text not null default 'review',
  route_path text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists soft_beta_route_audit (
  id uuid primary key default gen_random_uuid(),
  route_path text not null unique,
  route_group text not null default 'public',
  launch_visibility text not null default 'visible',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists soft_beta_deployment_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_type text not null default 'deployment',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists idx_soft_beta_readiness_status on soft_beta_readiness_items(status);
create index if not exists idx_soft_beta_go_live_status on soft_beta_go_live_tasks(task_status);
create index if not exists idx_soft_beta_public_checks_status on soft_beta_public_checks(check_status);
create index if not exists idx_soft_beta_route_audit_visibility on soft_beta_route_audit(launch_visibility);

insert into soft_beta_readiness_items (title, description, status, owner, sort_order)
values
  ('Homepage is beta ready', 'Hero, story cards, utilities and local sections look intentional on desktop and phone.', 'review', 'Admin / Editor', 10),
  ('Publishing path works end to end', 'A draft can move through edit, media, SEO, preview and publish without confusion.', 'review', 'Admin / Editor', 20),
  ('Article pages feel trustworthy', 'Byline, date, image credit, captions, alt text, corrections link and share metadata are present.', 'review', 'Admin / Editor', 30),
  ('Mobile experience is acceptable', 'Navigation, article reading, forms and homepage cards work cleanly on phone.', 'review', 'Admin / Editor', 40),
  ('Experimental admin areas are parked', 'Duplicate desks and unfinished tools are not part of the daily path.', 'working', 'Admin / Editor', 50),
  ('Production settings are ready', 'Environment variables, Supabase project, domain, RSS, sitemap and metadata point to production.', 'review', 'Admin / Editor', 60)
on conflict do nothing;

insert into soft_beta_go_live_tasks (task_title, description, task_status, owner, sort_order, due_note)
values
  ('Run one full publish simulation', 'Create or edit a real story, attach media, check metadata, publish and verify the live page.', 'review', 'Admin / Editor', 10, 'Before upload'),
  ('Check top public routes', 'Homepage, article page, archive, contact, newsletter, emergency and beta-ready pages should load cleanly.', 'review', 'Admin / Editor', 20, 'Before upload'),
  ('Verify RSS and sitemap', 'Open rss.xml, sitemap.xml and news-sitemap.xml after deploy.', 'review', 'Admin / Editor', 30, 'After deploy'),
  ('Confirm Supabase production data', 'Make sure the online site is connected to the intended Supabase project.', 'review', 'Admin / Editor', 40, 'Before deploy'),
  ('Set a soft beta observation window', 'Use the first few days online to log issues instead of adding new features.', 'review', 'Admin / Editor', 50, 'After deploy')
on conflict do nothing;

insert into soft_beta_public_checks (check_title, description, check_status, route_path, sort_order)
values
  ('Homepage smoke test', 'No broken hero, missing image, duplicate lead story or obvious stale section.', 'review', '/', 10),
  ('Article smoke test', 'Story pages render with headline, body, image, byline, date and metadata.', 'review', '/articles', 20),
  ('Newsletter smoke test', 'Signup path is visible and does not feel unfinished.', 'review', '/newsletter', 30),
  ('Contact smoke test', 'Readers can find how to reach HGN.', 'review', '/contact', 40),
  ('Beta readiness status', 'The beta-ready page gives a clear internal launch status.', 'review', '/beta-ready', 50)
on conflict do nothing;

insert into soft_beta_route_audit (route_path, route_group, launch_visibility, notes)
values
  ('/admin/soft-beta-launch', 'admin', 'primary', 'Main go-live cockpit for upload readiness.'),
  ('/admin/simple-home', 'admin', 'primary', 'Simple daily admin start point.'),
  ('/admin/newsroom-hub', 'admin', 'primary', 'Daily newsroom operations hub.'),
  ('/admin/core-workflow', 'admin', 'primary', 'Preferred publishing rhythm.'),
  ('/admin/admin-map', 'admin', 'cleanup', 'Use to park duplicated admin tools.'),
  ('/beta-ready', 'public', 'visible', 'Public/internal status page for soft beta readiness.'),
  ('/launch-status', 'public', 'visible', 'Launch status summary from v126.')
on conflict (route_path) do update set
  route_group = excluded.route_group,
  launch_visibility = excluded.launch_visibility,
  notes = excluded.notes,
  updated_at = now();

insert into soft_beta_deployment_notes (note_title, note_body, note_type, status)
values
  ('v127 launch cockpit installed', 'Use /admin/soft-beta-launch as the final check before uploading HGN for soft beta testing.', 'deployment', 'open')
on conflict do nothing;
