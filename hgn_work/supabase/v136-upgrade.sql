-- HGN v136 - Soft Beta Deployment Suite
-- Final online deployment readiness layer for the two-person admin/editor soft beta.

create table if not exists public.soft_beta_deployment_steps (
  id uuid primary key default gen_random_uuid(),
  item_title text not null,
  item_group text default 'deployment',
  status text default 'review',
  severity text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.soft_beta_environment_checks (
  id uuid primary key default gen_random_uuid(),
  item_title text not null,
  item_group text default 'environment',
  status text default 'review',
  severity text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.soft_beta_smoke_checks (
  id uuid primary key default gen_random_uuid(),
  route_label text not null,
  route_path text not null,
  status text default 'review',
  severity text default 'medium',
  expected_result text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.soft_beta_rollback_items (
  id uuid primary key default gen_random_uuid(),
  item_title text not null,
  item_group text default 'rollback',
  status text default 'review',
  severity text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.soft_beta_deployment_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- Defensive columns for partial installs / reruns.
alter table if exists public.soft_beta_deployment_steps add column if not exists owner text default 'Admin / Editor';
alter table if exists public.soft_beta_deployment_steps add column if not exists severity text default 'medium';
alter table if exists public.soft_beta_deployment_steps add column if not exists notes text;
alter table if exists public.soft_beta_deployment_steps add column if not exists sort_order integer default 100;
alter table if exists public.soft_beta_deployment_steps add column if not exists updated_at timestamptz default now();

alter table if exists public.soft_beta_environment_checks add column if not exists owner text default 'Admin / Editor';
alter table if exists public.soft_beta_environment_checks add column if not exists severity text default 'medium';
alter table if exists public.soft_beta_environment_checks add column if not exists notes text;
alter table if exists public.soft_beta_environment_checks add column if not exists sort_order integer default 100;
alter table if exists public.soft_beta_environment_checks add column if not exists updated_at timestamptz default now();

alter table if exists public.soft_beta_smoke_checks add column if not exists severity text default 'medium';
alter table if exists public.soft_beta_smoke_checks add column if not exists expected_result text;
alter table if exists public.soft_beta_smoke_checks add column if not exists sort_order integer default 100;
alter table if exists public.soft_beta_smoke_checks add column if not exists updated_at timestamptz default now();

alter table if exists public.soft_beta_rollback_items add column if not exists owner text default 'Admin / Editor';
alter table if exists public.soft_beta_rollback_items add column if not exists severity text default 'medium';
alter table if exists public.soft_beta_rollback_items add column if not exists notes text;
alter table if exists public.soft_beta_rollback_items add column if not exists sort_order integer default 100;
alter table if exists public.soft_beta_rollback_items add column if not exists updated_at timestamptz default now();

alter table if exists public.soft_beta_deployment_notes add column if not exists owner text default 'Admin / Editor';
alter table if exists public.soft_beta_deployment_notes add column if not exists status text default 'open';
alter table if exists public.soft_beta_deployment_notes add column if not exists note_body text;
alter table if exists public.soft_beta_deployment_notes add column if not exists updated_at timestamptz default now();

create index if not exists soft_beta_deployment_steps_status_idx on public.soft_beta_deployment_steps(status);
create index if not exists soft_beta_environment_checks_status_idx on public.soft_beta_environment_checks(status);
create index if not exists soft_beta_smoke_checks_status_idx on public.soft_beta_smoke_checks(status);
create index if not exists soft_beta_rollback_items_status_idx on public.soft_beta_rollback_items(status);

insert into public.soft_beta_deployment_steps (item_title, item_group, status, severity, owner, notes, sort_order)
values
  ('Run final production build', 'build', 'review', 'critical', 'Admin / Editor', 'Run npm install and npm run build before uploading online. Fix only true blockers during freeze.', 10),
  ('Apply migrations through v136', 'database', 'review', 'critical', 'Admin / Editor', 'Run the latest SQL after v135 and confirm the deployment tables exist.', 20),
  ('Publish one real beta story end to end', 'newsroom', 'review', 'critical', 'Admin / Editor', 'Create, edit, add image metadata, publish, place on homepage, and read on phone.', 30),
  ('Confirm homepage looks current', 'homepage', 'review', 'high', 'Admin / Editor', 'Hero, top stories, live updates, weather, and local utility cards should feel fresh.', 40),
  ('Confirm admin/editor daily path', 'workflow', 'review', 'high', 'Admin / Editor', 'Use the simplified admin path instead of jumping through older duplicate desks.', 50)
on conflict do nothing;

insert into public.soft_beta_environment_checks (item_title, item_group, status, severity, owner, notes, sort_order)
values
  ('Production Supabase URL set', 'env', 'review', 'critical', 'Admin / Editor', 'Confirm production environment variables point to the intended Supabase project.', 10),
  ('Public anon key set', 'env', 'review', 'critical', 'Admin / Editor', 'Confirm the public anon key is present in hosting settings.', 20),
  ('Site URL and canonical domain checked', 'env', 'review', 'high', 'Admin / Editor', 'Confirm final domain, canonical URLs, RSS, sitemap, and robots output are aligned.', 30),
  ('Image and media path checked', 'media', 'review', 'high', 'Admin / Editor', 'Confirm uploaded media and article images load on the deployed site.', 40)
on conflict do nothing;

insert into public.soft_beta_smoke_checks (route_label, route_path, status, severity, expected_result, sort_order)
values
  ('Homepage', '/', 'review', 'critical', 'Loads quickly and shows current HGN front page content.', 10),
  ('Article page', '/articles', 'review', 'critical', 'Article list and at least one story page render correctly.', 20),
  ('Admin home', '/admin', 'review', 'critical', 'Admin/editor workflow entry loads without dead links.', 30),
  ('Soft beta deployment status', '/soft-beta-deployment-status', 'review', 'medium', 'Public-safe launch status page renders.', 40),
  ('RSS feed', '/rss.xml', 'review', 'high', 'RSS output is reachable for indexing and readers.', 50),
  ('News sitemap', '/news-sitemap.xml', 'review', 'high', 'News sitemap is reachable for Google News readiness.', 60)
on conflict do nothing;

insert into public.soft_beta_rollback_items (item_title, item_group, status, severity, owner, notes, sort_order)
values
  ('Keep last working zip available', 'rollback', 'review', 'high', 'Admin / Editor', 'Keep the last known-good package nearby before uploading v136.', 10),
  ('Record migration order', 'rollback', 'review', 'high', 'Admin / Editor', 'Write down the last successfully applied migration before running the next one.', 20),
  ('Know how to disable experimental links', 'rollback', 'review', 'medium', 'Admin / Editor', 'If something feels unfinished online, hide the navigation link instead of rebuilding everything.', 30)
on conflict do nothing;

insert into public.soft_beta_deployment_notes (note_title, note_body, status, owner)
values ('Soft beta upload note', 'Use this as the single place to record what changed during the online beta upload.', 'open', 'Admin / Editor')
on conflict do nothing;
