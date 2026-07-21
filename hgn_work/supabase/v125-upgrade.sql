-- HGN v125 - Release Candidate Desk
-- Consolidation-first stabilization for the two-person admin/editor beta.

create table if not exists release_candidate_checks (
  id bigserial primary key,
  title text not null,
  description text,
  check_group text not null default 'core',
  check_status text not null default 'review',
  owner_label text not null default 'Admin / Editor',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists release_candidate_routes (
  id bigserial primary key,
  title text not null,
  href text not null,
  route_group text not null default 'primary',
  route_status text not null default 'keep',
  description text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists release_candidate_notes (
  id bigserial primary key,
  title text not null,
  note text,
  note_status text not null default 'open',
  owner_label text not null default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_release_candidate_checks_status on release_candidate_checks(check_status);
create index if not exists idx_release_candidate_checks_group on release_candidate_checks(check_group);
create index if not exists idx_release_candidate_routes_status on release_candidate_routes(route_status);
create index if not exists idx_release_candidate_routes_group on release_candidate_routes(route_group);

insert into release_candidate_checks (title, description, check_group, check_status, owner_label, sort_order)
values
  ('Admin home starts in one place', 'The daily path should begin at one clear admin screen, not five overlapping desks.', 'navigation', 'ready', 'Admin / Editor', 10),
  ('Article publish path is obvious', 'Draft, edit, image, SEO, homepage and publish should feel like one rhythm.', 'publishing', 'review', 'Admin / Editor', 20),
  ('Homepage can be refreshed quickly', 'Lead story, stale items and priority slots should be easy to update before soft beta.', 'homepage', 'ready', 'Admin / Editor', 30),
  ('Duplicate desks are parked', 'Older workflow screens can remain in the codebase but should not distract from the daily path.', 'cleanup', 'review', 'Admin / Editor', 40),
  ('No public-beta language overpromises', 'The site should reflect that testing is internal with admin/editor, not a wide public beta group.', 'copy', 'ready', 'Admin / Editor', 50),
  ('Known blockers are visible', 'Anything blocking soft beta should be captured in one place before calling the build release-candidate ready.', 'risk', 'review', 'Admin / Editor', 60)
on conflict do nothing;

insert into release_candidate_routes (title, href, route_group, route_status, description, sort_order)
values
  ('Admin Home', '/admin', 'primary', 'keep', 'The clean starting point for daily admin/editor work.', 10),
  ('Newsroom Hub', '/admin/newsroom-hub', 'primary', 'keep', 'Consolidated daily operations view.', 20),
  ('Core Workflow', '/admin/core-workflow', 'primary', 'keep', 'Preferred publishing rhythm for the two-person beta.', 30),
  ('Articles', '/admin/articles', 'primary', 'keep', 'Core story creation and publishing.', 40),
  ('Homepage Control', '/admin/homepage-control', 'primary', 'keep', 'Front page control without dashboard hopping.', 50),
  ('Beta Freeze Prep', '/admin/beta-freeze', 'cleanup', 'occasional', 'Use when deciding whether to pause new features.', 60),
  ('Launch Cleanup', '/admin/launch-cleanup', 'cleanup', 'occasional', 'Use for cleanup passes before soft beta.', 70),
  ('Admin Map', '/admin/admin-map', 'cleanup', 'occasional', 'Use to decide which tools stay visible.', 80)
on conflict do nothing;

insert into release_candidate_notes (title, note, note_status, owner_label)
values
  ('Release candidate rule', 'Only add something now if it makes the admin/editor daily workflow simpler, faster or safer.', 'open', 'Admin / Editor')
on conflict do nothing;
