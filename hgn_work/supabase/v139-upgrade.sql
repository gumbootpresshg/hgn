-- HGN v139 - Launch Rehearsal
-- Defensive migration for rehearsing the real online soft-beta upload.

create extension if not exists pgcrypto;

create table if not exists public.launch_rehearsal_steps (
  id uuid primary key default gen_random_uuid(),
  step_title text not null,
  step_group text default 'deployment',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.launch_rehearsal_steps add column if not exists step_title text;
alter table public.launch_rehearsal_steps add column if not exists step_group text default 'deployment';
alter table public.launch_rehearsal_steps add column if not exists status text default 'review';
alter table public.launch_rehearsal_steps add column if not exists priority text default 'medium';
alter table public.launch_rehearsal_steps add column if not exists owner text default 'Admin / Editor';
alter table public.launch_rehearsal_steps add column if not exists notes text;
alter table public.launch_rehearsal_steps add column if not exists sort_order integer default 100;
alter table public.launch_rehearsal_steps add column if not exists created_at timestamptz default now();
alter table public.launch_rehearsal_steps add column if not exists updated_at timestamptz default now();

create table if not exists public.launch_rehearsal_route_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text default 'public route',
  route_path text,
  expected_result text,
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.launch_rehearsal_route_checks add column if not exists check_title text;
alter table public.launch_rehearsal_route_checks add column if not exists check_group text default 'public route';
alter table public.launch_rehearsal_route_checks add column if not exists route_path text;
alter table public.launch_rehearsal_route_checks add column if not exists expected_result text;
alter table public.launch_rehearsal_route_checks add column if not exists status text default 'review';
alter table public.launch_rehearsal_route_checks add column if not exists priority text default 'medium';
alter table public.launch_rehearsal_route_checks add column if not exists owner text default 'Admin / Editor';
alter table public.launch_rehearsal_route_checks add column if not exists sort_order integer default 100;
alter table public.launch_rehearsal_route_checks add column if not exists created_at timestamptz default now();
alter table public.launch_rehearsal_route_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.launch_rehearsal_content_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text default 'content',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.launch_rehearsal_content_checks add column if not exists check_title text;
alter table public.launch_rehearsal_content_checks add column if not exists check_group text default 'content';
alter table public.launch_rehearsal_content_checks add column if not exists status text default 'review';
alter table public.launch_rehearsal_content_checks add column if not exists priority text default 'medium';
alter table public.launch_rehearsal_content_checks add column if not exists owner text default 'Admin / Editor';
alter table public.launch_rehearsal_content_checks add column if not exists notes text;
alter table public.launch_rehearsal_content_checks add column if not exists sort_order integer default 100;
alter table public.launch_rehearsal_content_checks add column if not exists created_at timestamptz default now();
alter table public.launch_rehearsal_content_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.launch_rehearsal_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.launch_rehearsal_notes add column if not exists note_title text;
alter table public.launch_rehearsal_notes add column if not exists note_body text;
alter table public.launch_rehearsal_notes add column if not exists status text default 'open';
alter table public.launch_rehearsal_notes add column if not exists owner text default 'Admin / Editor';
alter table public.launch_rehearsal_notes add column if not exists created_at timestamptz default now();
alter table public.launch_rehearsal_notes add column if not exists updated_at timestamptz default now();

create index if not exists idx_launch_rehearsal_steps_status on public.launch_rehearsal_steps(status);
create index if not exists idx_launch_rehearsal_steps_sort on public.launch_rehearsal_steps(sort_order);
create index if not exists idx_launch_rehearsal_route_checks_status on public.launch_rehearsal_route_checks(status);
create index if not exists idx_launch_rehearsal_route_checks_sort on public.launch_rehearsal_route_checks(sort_order);
create index if not exists idx_launch_rehearsal_content_checks_status on public.launch_rehearsal_content_checks(status);
create index if not exists idx_launch_rehearsal_content_checks_sort on public.launch_rehearsal_content_checks(sort_order);

insert into public.launch_rehearsal_steps (step_title, step_group, status, priority, owner, notes, sort_order)
select * from (values
  ('Run the upload rehearsal once', 'deployment', 'review', 'critical', 'Admin / Editor', 'Treat this like the real online beta upload: migration, build, homepage check, article check, mobile check, and rollback note.', 10),
  ('Publish one real beta story', 'content', 'review', 'critical', 'Admin / Editor', 'Use a real article, real image, real caption, real SEO title, and real homepage placement to expose any remaining friction.', 20),
  ('Hide anything unfinished', 'cleanup', 'review', 'high', 'Admin', 'The soft beta should feel calm. Hide experimental routes from navigation instead of showing every internal tool.', 30),
  ('Confirm the preferred admin route', 'workflow', 'review', 'high', 'Admin / Editor', 'Use the simplified admin/editor path first. Keep older desks available only when they solve a specific issue.', 40),
  ('Write the rollback note', 'recovery', 'review', 'high', 'Admin', 'Know which zip and SQL version was last good before uploading the new beta package.', 50)
) as seed(step_title, step_group, status, priority, owner, notes, sort_order)
where not exists (select 1 from public.launch_rehearsal_steps where launch_rehearsal_steps.step_title = seed.step_title);

insert into public.launch_rehearsal_route_checks (check_title, check_group, route_path, expected_result, status, priority, owner, sort_order)
select * from (values
  ('Homepage first screen is clean', 'public route', '/', 'Hero, lead story, local utilities, and spacing look intentional on desktop and phone.', 'review', 'critical', 'Admin / Editor', 10),
  ('Article path is trustworthy', 'public route', '/articles', 'Article list and article detail pages show headline, byline, image, caption, date, and readable mobile spacing.', 'review', 'critical', 'Admin / Editor', 20),
  ('Admin opens to a simple path', 'admin route', '/admin', 'Admin workflow is understandable for the two-person admin/editor beta, not a wall of experimental tools.', 'review', 'high', 'Admin', 30),
  ('Launch status opens', 'public-safe route', '/launch-rehearsal-status', 'Status page renders a simple upload-readiness snapshot.', 'review', 'medium', 'Admin', 40),
  ('Production lock remains available', 'admin route', '/admin/production-lock', 'Previous production lock page remains available for deployment troubleshooting.', 'review', 'medium', 'Admin', 50)
) as seed(check_title, check_group, route_path, expected_result, status, priority, owner, sort_order)
where not exists (select 1 from public.launch_rehearsal_route_checks where launch_rehearsal_route_checks.check_title = seed.check_title);

insert into public.launch_rehearsal_content_checks (check_title, check_group, status, priority, owner, notes, sort_order)
select * from (values
  ('Lead story has complete media', 'article quality', 'review', 'critical', 'Admin / Editor', 'Featured image, alt text, caption, credit, and crop should be checked before upload rehearsal.', 10),
  ('SEO basics are complete', 'article quality', 'review', 'high', 'Admin / Editor', 'Slug, title, excerpt, canonical behavior, and social share preview should be checked on the rehearsal story.', 20),
  ('Homepage is not stale', 'homepage', 'review', 'high', 'Admin / Editor', 'The lead story and visible cards should make the site feel alive for a first soft-beta visitor.', 30),
  ('Mobile reading is comfortable', 'mobile', 'review', 'critical', 'Admin / Editor', 'Check headline size, image scaling, article body width, tap targets, and nav behavior on a phone.', 40)
) as seed(check_title, check_group, status, priority, owner, notes, sort_order)
where not exists (select 1 from public.launch_rehearsal_content_checks where launch_rehearsal_content_checks.check_title = seed.check_title);

insert into public.launch_rehearsal_notes (note_title, note_body, status, owner)
select 'v139 launch rehearsal note', 'Use this version to rehearse the real online beta upload before treating the site as public-facing. Keep the scope frozen and focus on confidence.', 'open', 'Admin / Editor'
where not exists (select 1 from public.launch_rehearsal_notes where note_title = 'v139 launch rehearsal note');
