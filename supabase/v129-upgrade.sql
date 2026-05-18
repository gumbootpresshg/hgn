-- HGN v129 - Online Beta Hardening
-- Focus: prepare the site for first real online soft beta with production, public UX, SEO, mobile, and rollback checks.

create table if not exists online_beta_hardening_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'launch',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  route_path text,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists online_beta_route_smoke_tests (
  id uuid primary key default gen_random_uuid(),
  route_path text not null unique,
  route_label text not null,
  status text not null default 'review',
  device_focus text not null default 'desktop and mobile',
  expected_result text,
  notes text,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists online_beta_rollout_steps (
  id uuid primary key default gen_random_uuid(),
  step_title text not null,
  step_group text not null default 'upload',
  status text not null default 'todo',
  owner text default 'Admin / Editor',
  notes text,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists online_beta_decision_log (
  id uuid primary key default gen_random_uuid(),
  decision_title text not null,
  decision_body text,
  status text not null default 'open',
  decided_by text default 'Admin / Editor',
  created_at timestamptz not null default now()
);

create index if not exists online_beta_hardening_checks_status_idx on online_beta_hardening_checks(status);
create index if not exists online_beta_hardening_checks_area_idx on online_beta_hardening_checks(area);
create index if not exists online_beta_hardening_checks_severity_idx on online_beta_hardening_checks(severity);
create index if not exists online_beta_route_smoke_tests_status_idx on online_beta_route_smoke_tests(status);
create index if not exists online_beta_rollout_steps_status_idx on online_beta_rollout_steps(status);

insert into online_beta_hardening_checks (title, area, status, severity, owner, notes, route_path, sort_order)
values
  ('Homepage soft beta first impression', 'public polish', 'review', 'critical', 'Admin / Editor', 'Homepage should feel current, local, mobile-friendly and trustworthy before upload.', '/', 10),
  ('Article page reading confidence', 'public polish', 'review', 'critical', 'Admin / Editor', 'Check headline, byline, image, caption, body width, related links, sharing and mobile readability.', '/articles', 20),
  ('Mobile navigation and tap targets', 'mobile', 'review', 'critical', 'Admin', 'Open on phone and verify menu, spacing, footer, forms and story cards.', '/', 30),
  ('Production environment variables', 'deployment', 'review', 'critical', 'Admin', 'Confirm Supabase URL/key, public site URL, metadata base URL, analytics and any production-only values.', null, 40),
  ('SEO crawl basics', 'seo', 'review', 'high', 'Admin / Editor', 'Confirm sitemap, RSS, news sitemap, robots, canonical URL and article metadata routes are reachable.', '/sitemap.xml', 50),
  ('Upload rollback note', 'deployment', 'review', 'high', 'Admin', 'Know the last good zip and how to redeploy it if the first online beta upload exposes a blocker.', null, 60),
  ('Hide unfinished public routes', 'cleanup', 'review', 'high', 'Admin / Editor', 'Any experimental section that is not ready should be removed from visible navigation before beta.', null, 70),
  ('Admin daily path sanity check', 'workflow', 'review', 'medium', 'Admin / Editor', 'The preferred path should be simple: admin home, newsroom hub, articles, homepage, launch ops.', '/admin', 80)
on conflict do nothing;

insert into online_beta_route_smoke_tests (route_path, route_label, status, device_focus, expected_result, notes, sort_order)
values
  ('/', 'Homepage', 'review', 'desktop and mobile', 'Loads quickly and looks like the current front page.', 'Check hero, cards, utilities, nav and footer.', 10),
  ('/articles', 'Article index', 'review', 'desktop and mobile', 'Shows story list or a clean empty/loading state.', 'No broken cards or missing layout.', 20),
  ('/admin', 'Admin home', 'review', 'desktop', 'Shows simple primary admin/editor workflow.', 'Should not feel like a maze.', 30),
  ('/admin/launch-ops', 'Launch ops', 'review', 'desktop', 'Shows soft beta operational checklist.', 'Use this before upload.', 40),
  ('/admin/production-polish', 'Production polish', 'review', 'desktop', 'Shows polish checklist and route confidence.', 'Final public-facing cleanup desk.', 50),
  ('/beta-ready', 'Beta ready', 'review', 'desktop and mobile', 'Shows a readable soft beta readiness view.', 'Useful confidence page.', 60),
  ('/live-updates', 'Live updates', 'review', 'desktop and mobile', 'Does not look broken when no active live item exists.', 'Important for credibility.', 70),
  ('/contact', 'Contact', 'review', 'desktop and mobile', 'Gives readers a way to reach HGN.', 'Confirm route exists or hide links.', 80)
on conflict (route_path) do nothing;

insert into online_beta_rollout_steps (step_title, step_group, status, owner, notes, sort_order)
values
  ('Freeze new feature desks', 'before upload', 'todo', 'Admin / Editor', 'Only bug fixes, polish and launch blockers after this point.', 10),
  ('Run homepage and article mobile pass', 'before upload', 'todo', 'Admin / Editor', 'Phone check matters more than desktop for local readers.', 20),
  ('Confirm production Supabase project and keys', 'before upload', 'todo', 'Admin', 'Avoid pointing online beta at the wrong database.', 30),
  ('Upload to hosting and test private URL first', 'upload', 'todo', 'Admin', 'Do not announce until the private production URL is checked.', 40),
  ('Run smoke tests on live deployment', 'after upload', 'todo', 'Admin / Editor', 'Check the main public and admin routes immediately after upload.', 50),
  ('Publish or update one real story', 'after upload', 'todo', 'Admin / Editor', 'Prove the real workflow works online.', 60),
  ('Check sitemap/RSS/news sitemap live', 'after upload', 'todo', 'Admin', 'Make sure discovery routes work from the production domain.', 70),
  ('Keep a rollback zip ready', 'rollback', 'todo', 'Admin', 'Use the last stable package if a launch blocker appears.', 80)
on conflict do nothing;

insert into online_beta_decision_log (decision_title, decision_body, status, decided_by)
values
  ('v129 online beta rule', 'From here, avoid adding new admin desks unless they remove more clutter than they add. Prioritize upload readiness, public polish, mobile checks and workflow stability.', 'open', 'Admin / Editor')
on conflict do nothing;
