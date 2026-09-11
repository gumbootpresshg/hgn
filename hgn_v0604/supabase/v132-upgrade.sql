-- HGN v132 - Beta Launch Gate
-- Focus: final online soft-beta gate, production upload confidence, and public route smoke checks.

create table if not exists beta_launch_gates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'launch gate',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beta_launch_public_routes (
  id uuid primary key default gen_random_uuid(),
  route_path text not null unique,
  route_label text not null,
  route_group text not null default 'public route',
  status text not null default 'review',
  severity text not null default 'medium',
  expected_result text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beta_launch_final_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text not null default 'production check',
  status text not null default 'review',
  severity text not null default 'medium',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beta_launch_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text not null default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_beta_launch_gates_status on beta_launch_gates(status);
create index if not exists idx_beta_launch_public_routes_status on beta_launch_public_routes(status);
create index if not exists idx_beta_launch_final_checks_status on beta_launch_final_checks(status);

insert into beta_launch_gates (title, area, status, severity, notes, sort_order)
values
  ('Homepage is credible on mobile and desktop', 'public polish', 'review', 'critical', 'Open the homepage cold and decide if it immediately feels like a real Haida Gwaii publication.', 10),
  ('One real article passes trust review', 'article trust', 'review', 'critical', 'Check byline, date, image credit, caption, alt text, SEO metadata and share preview.', 20),
  ('Production environment is ready', 'deployment', 'review', 'critical', 'Confirm Supabase keys, storage, domain, redirects, robots, RSS and sitemap before upload.', 30),
  ('Admin/editor daily path is simple', 'workflow', 'review', 'high', 'Start from the primary admin route and confirm there is no need to jump through five desks to publish.', 40),
  ('Rollback notes are written', 'safety', 'review', 'high', 'Know what to revert or disable if the first online beta upload exposes a problem.', 50)
on conflict do nothing;

insert into beta_launch_public_routes (route_path, route_label, route_group, status, severity, expected_result, sort_order)
values
  ('/', 'Homepage', 'core public', 'review', 'critical', 'Current, local, credible, mobile-safe and not cluttered.', 10),
  ('/articles', 'Articles index', 'core public', 'review', 'high', 'Recent stories are easy to scan and open.', 20),
  ('/contact', 'Contact', 'trust', 'review', 'high', 'Readers can quickly reach HGN.', 30),
  ('/trust', 'Trust page', 'trust', 'review', 'medium', 'Transparency content feels useful without being overbuilt.', 40),
  ('/request-correction', 'Request correction', 'trust', 'review', 'medium', 'Correction request path works and feels credible.', 50),
  ('/newsletter', 'Newsletter', 'audience', 'review', 'medium', 'Signup path is visible and not confusing.', 60),
  ('/weather', 'Weather', 'utility', 'review', 'medium', 'Useful local utility page with safe empty states.', 70)
on conflict (route_path) do nothing;

insert into beta_launch_final_checks (check_title, check_group, status, severity, notes, sort_order)
values
  ('Run npm install before production build', 'build', 'review', 'critical', 'The zip does not include node_modules, so install dependencies before running Next build.', 10),
  ('Run the full Supabase migration chain through v132', 'database', 'review', 'critical', 'Apply the new SQL after previous migrations are in place and confirm no duplicate table errors.', 20),
  ('Confirm no unfinished pages are linked publicly', 'route cleanup', 'review', 'high', 'Experimental routes can exist, but beta visitors should not be sent there.', 30),
  ('Check mobile article reading flow', 'mobile', 'review', 'critical', 'Read a full story on a phone and check spacing, images, metadata and prompts.', 40),
  ('Validate RSS, sitemap and robots', 'discovery', 'review', 'high', 'Google and social discovery depend on these being reachable and correct.', 50),
  ('Publish one test story end to end', 'workflow', 'review', 'critical', 'Create or edit a story, attach media, set metadata, publish, place on homepage and verify public view.', 60)
on conflict do nothing;

insert into beta_launch_notes (note_title, note_body, status, owner)
values ('v132 beta launch gate note', 'This is the point where HGN should stop expanding and prove the online soft-beta path: homepage, article, mobile, production config and one daily admin/editor workflow.', 'open', 'Admin / Editor')
on conflict do nothing;
