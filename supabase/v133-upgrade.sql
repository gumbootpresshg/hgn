-- HGN v133 - Deployment Runway
-- Focus: online beta deployment confidence, environment readiness, and final launch-day sequence.

create table if not exists deployment_runway_steps (
  id uuid primary key default gen_random_uuid(),
  step_title text not null,
  step_group text not null default 'deployment',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deployment_runway_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text not null default 'production check',
  status text not null default 'review',
  severity text not null default 'medium',
  expected_result text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deployment_runway_cutover_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text not null default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_deployment_runway_steps_status on deployment_runway_steps(status);
create index if not exists idx_deployment_runway_checks_status on deployment_runway_checks(status);
create index if not exists idx_deployment_runway_steps_group on deployment_runway_steps(step_group);

insert into deployment_runway_steps (step_title, step_group, status, severity, notes, sort_order)
values
  ('Lock the soft-beta build', 'build', 'review', 'critical', 'Stop feature changes once this package is installed. Only fix blockers after this point.', 10),
  ('Create production Supabase project or confirm current production project', 'database', 'review', 'critical', 'Confirm database URL, anon key, service role handling, storage buckets and migration order.', 20),
  ('Run migrations through v133 in order', 'database', 'review', 'critical', 'Apply the SQL chain and confirm the v133 tables exist before uploading.', 30),
  ('Set production environment variables', 'deployment', 'review', 'critical', 'Confirm site URL, Supabase keys, storage, analytics and any email/newsletter settings.', 40),
  ('Upload to hosting and run production build', 'deployment', 'review', 'critical', 'Install dependencies, build, and confirm the deployment finishes without route errors.', 50),
  ('Smoke test public pages from a phone', 'mobile', 'review', 'critical', 'Open homepage, one article, contact, newsletter, trust and correction pages on mobile.', 60),
  ('Publish one real beta story end to end', 'workflow', 'review', 'high', 'Use the admin/editor workflow to publish, feature, check metadata and verify the live story.', 70),
  ('Record rollback notes', 'safety', 'review', 'high', 'Write down how to disable the beta, revert a deployment, or hide an unfinished route.', 80)
on conflict do nothing;

insert into deployment_runway_checks (check_title, check_group, status, severity, expected_result, sort_order)
values
  ('Homepage loads quickly enough for beta', 'performance', 'review', 'critical', 'Homepage should feel responsive on mobile and not depend on unfinished widgets.', 10),
  ('Article page looks trustworthy', 'article quality', 'review', 'critical', 'Byline, date, image credit, caption, alt text and sharing metadata are present.', 20),
  ('Admin primary route is clear', 'workflow', 'review', 'high', 'Admin/editor can start from one place without hunting through old desks.', 30),
  ('Experimental public routes are hidden from navigation', 'cleanup', 'review', 'high', 'Unfinished pages can exist but should not be promoted during soft beta.', 40),
  ('RSS, sitemap and robots are reachable', 'discovery', 'review', 'high', 'Discovery files should respond correctly after upload.', 50),
  ('Correction/contact paths work', 'trust', 'review', 'medium', 'Readers can report issues and contact HGN without confusion.', 60),
  ('Newsletter path is visible but not overpromised', 'audience', 'review', 'medium', 'Signup and archive pages should be clear for beta.', 70)
on conflict do nothing;

insert into deployment_runway_cutover_notes (note_title, note_body, status, owner)
values ('v133 deployment runway note', 'This upgrade is meant to move HGN from almost ready to upload-ready: freeze features, confirm production config, run the build, smoke test on mobile, publish one story, and keep rollback notes close.', 'open', 'Admin / Editor')
on conflict do nothing;
