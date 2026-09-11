-- HGN v135 - Go-Live Command
-- Final online beta upload command layer for a two-person admin/editor workflow.

create table if not exists go_live_command_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text not null default 'launch',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists go_live_route_checks (
  id uuid primary key default gen_random_uuid(),
  route_label text not null,
  route_path text not null,
  status text not null default 'review',
  severity text not null default 'medium',
  expected_result text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists go_live_environment_items (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text not null default 'environment',
  status text not null default 'review',
  severity text not null default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists go_live_handoff_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text not null default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists go_live_command_checks_status_idx on go_live_command_checks(status);
create index if not exists go_live_command_checks_sort_idx on go_live_command_checks(sort_order);
create index if not exists go_live_route_checks_status_idx on go_live_route_checks(status);
create index if not exists go_live_environment_items_status_idx on go_live_environment_items(status);

insert into go_live_command_checks (check_title, check_group, status, severity, owner, notes, sort_order)
values
  ('Run clean production build', 'deployment', 'review', 'critical', 'Admin', 'Run npm install and npm run build before uploading. Fix only real blockers after this point.', 10),
  ('Apply migrations through v135', 'database', 'review', 'critical', 'Admin', 'Run the SQL files in order and confirm v135-upgrade.sql is the final migration applied.', 20),
  ('Publish one real story end to end', 'newsroom', 'review', 'critical', 'Admin / Editor', 'Create or edit one real beta story, add media metadata, publish it, feature it on the homepage and read it on mobile.', 30),
  ('Phone-first homepage pass', 'mobile', 'review', 'high', 'Admin / Editor', 'Open the homepage on a phone and check hero story, menu, spacing, image crops and scroll depth.', 40),
  ('Rollback note written', 'deployment', 'review', 'high', 'Admin', 'Write down the last known good zip, latest SQL applied and how to revert if upload fails.', 50)
on conflict do nothing;

insert into go_live_route_checks (route_label, route_path, status, severity, expected_result, sort_order)
values
  ('Homepage', '/', 'review', 'critical', 'Loads quickly, has a clear lead story, and does not show unfinished beta clutter.', 10),
  ('Articles', '/articles', 'review', 'critical', 'Article list loads and stories open without build/runtime errors.', 20),
  ('One article page', '/articles/[slug]', 'review', 'critical', 'A real story renders with title, date, byline, image, body and metadata.', 30),
  ('Contact', '/contact', 'review', 'high', 'Readers can find how to contact HGN.', 40),
  ('Advertise', '/advertise', 'review', 'medium', 'Advertisers can find basic next steps without confusion.', 50),
  ('Go-live status', '/go-live-status', 'review', 'medium', 'Public-safe status page loads without exposing private admin details.', 60)
on conflict do nothing;

insert into go_live_environment_items (check_title, check_group, status, severity, owner, notes, sort_order)
values
  ('Production Supabase URL set', 'environment', 'review', 'critical', 'Admin', 'Confirm the deployed app uses the correct production Supabase project and public anon key.', 10),
  ('Image domains configured', 'environment', 'review', 'high', 'Admin', 'Confirm article images, imported WordPress images and storage images are allowed by Next config.', 20),
  ('RSS and sitemap reachable', 'seo', 'review', 'high', 'Admin', 'Check rss.xml, sitemap.xml and news sitemap routes after upload.', 30),
  ('Analytics decision made', 'analytics', 'review', 'medium', 'Admin', 'Decide whether analytics are installed now or intentionally postponed during private beta.', 40)
on conflict do nothing;

insert into go_live_handoff_notes (note_title, note_body, status, owner)
values
  ('Go-live rule', 'After this package, avoid new feature surfaces until HGN is uploaded and tested online. Fix blockers, copy, build, mobile and production issues only.', 'open', 'Admin / Editor'),
  ('First beta session', 'Use the first online session to publish one real story, test homepage placement, check mobile and write down every rough edge.', 'open', 'Admin / Editor')
on conflict do nothing;
