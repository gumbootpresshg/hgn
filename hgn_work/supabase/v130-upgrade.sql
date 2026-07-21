-- HGN v130 - Soft Launch Prep Suite
-- Consolidated final-prep tables for online soft beta upload readiness.

create table if not exists public.soft_launch_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'launch',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.soft_launch_route_checks (
  id uuid primary key default gen_random_uuid(),
  route_label text not null,
  route_path text not null,
  route_group text not null default 'public',
  status text not null default 'review',
  severity text not null default 'medium',
  expected_result text,
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.soft_launch_polish_items (
  id uuid primary key default gen_random_uuid(),
  item_title text not null,
  area text not null default 'polish',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.soft_launch_deployment_steps (
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

create table if not exists public.soft_launch_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text not null default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_soft_launch_checks_status on public.soft_launch_checks(status);
create index if not exists idx_soft_launch_checks_sort on public.soft_launch_checks(sort_order);
create index if not exists idx_soft_launch_route_checks_status on public.soft_launch_route_checks(status);
create index if not exists idx_soft_launch_route_checks_sort on public.soft_launch_route_checks(sort_order);
create index if not exists idx_soft_launch_polish_items_status on public.soft_launch_polish_items(status);
create index if not exists idx_soft_launch_polish_items_sort on public.soft_launch_polish_items(sort_order);
create index if not exists idx_soft_launch_deployment_steps_status on public.soft_launch_deployment_steps(status);
create index if not exists idx_soft_launch_deployment_steps_sort on public.soft_launch_deployment_steps(sort_order);

insert into public.soft_launch_checks (title, area, status, severity, notes, sort_order)
values
  ('Homepage first impression', 'public polish', 'review', 'critical', 'Confirm the homepage feels current, local, useful and trustworthy on mobile and desktop.', 10),
  ('Article page publishing quality', 'publishing', 'review', 'critical', 'Check headline, hero image, caption, credit, SEO title, description, related links and mobile reading flow.', 20),
  ('Admin/editor daily path', 'workflow', 'review', 'high', 'Confirm the main admin path is simple enough for the two-person beta workflow.', 30),
  ('Google News and RSS basics', 'distribution', 'review', 'high', 'Confirm sitemap, news sitemap, RSS and article metadata are valid before online beta.', 40),
  ('Mobile navigation and readability', 'mobile', 'review', 'critical', 'Confirm menu, article text, cards, buttons and forms work comfortably on phone screens.', 50)
on conflict do nothing;

insert into public.soft_launch_route_checks (route_label, route_path, route_group, status, severity, expected_result, sort_order)
values
  ('Homepage', '/', 'public', 'review', 'critical', 'Loads quickly, shows a fresh lead story and has clear local hierarchy.', 10),
  ('Article page', '/articles', 'public', 'review', 'critical', 'Article listing and article detail pages are readable and shareable.', 20),
  ('Admin home', '/admin/simple-home', 'admin', 'review', 'high', 'Admin/editor can see what to do next without opening several desks.', 30),
  ('Soft launch admin', '/admin/soft-launch', 'admin', 'ready', 'medium', 'Launch readiness view loads without errors.', 40),
  ('Public launch status', '/soft-launch-status', 'public', 'ready', 'medium', 'Simple readiness status is available during upload prep.', 50)
on conflict do nothing;

insert into public.soft_launch_polish_items (item_title, area, status, severity, notes, sort_order)
values
  ('Hide unfinished public pages', 'cleanup', 'review', 'critical', 'Only expose pages that feel reliable enough for readers during soft beta.', 10),
  ('Tighten homepage card spacing', 'frontend', 'review', 'high', 'Make cards, headings and sections feel consistent on desktop and mobile.', 20),
  ('Confirm image crops', 'media', 'review', 'high', 'Hero, cards, social previews and mobile crops should not cut off important photo details.', 30),
  ('Reduce admin nav noise', 'admin', 'review', 'medium', 'Keep primary tools visible and park older experimental desks.', 40)
on conflict do nothing;

insert into public.soft_launch_deployment_steps (step_title, step_group, status, severity, notes, sort_order)
values
  ('Confirm production Supabase project', 'environment', 'review', 'critical', 'Use production keys, production URL settings and a clean migration sequence.', 10),
  ('Run final local build', 'build', 'review', 'critical', 'Run npm install, SQL migrations and npm run build before online upload.', 20),
  ('Prepare rollback package', 'deployment', 'review', 'high', 'Keep the previous confirmed zip and SQL migration notes available before deploying.', 30),
  ('Publish first test story online', 'publishing', 'review', 'high', 'Publish one real story and verify homepage, RSS, sitemap, social preview and mobile article view.', 40)
on conflict do nothing;

insert into public.soft_launch_notes (note_title, note_body, status, owner)
values ('Soft launch operating note', 'Use this suite as the final upload checklist for the admin/editor beta workflow. Do not add more desks until the online beta is stable.', 'open', 'Admin / Editor')
on conflict do nothing;
