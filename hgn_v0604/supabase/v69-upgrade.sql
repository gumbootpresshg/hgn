-- HGN v69 upgrade: Beta Tester Intake + Onboarding
-- Adds a lightweight beta tester CRM, invite batches, and onboarding tasks.

create table if not exists beta_testers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  community text,
  role text not null default 'reader' check (role in ('reader', 'contributor', 'business', 'advertiser', 'community_org', 'staff', 'other')),
  device text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'critical')),
  status text not null default 'new' check (status in ('new', 'invited', 'active', 'paused', 'complete', 'declined')),
  source text not null default 'beta-join',
  interests text,
  notes text,
  invite_sent_at timestamptz,
  activated_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beta_invite_batches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  audience text not null default 'readers' check (audience in ('readers', 'contributors', 'businesses', 'advertisers', 'internal', 'mixed')),
  status text not null default 'draft' check (status in ('draft', 'ready', 'sent', 'closed')),
  target_count integer not null default 0,
  sent_count integer not null default 0,
  owner text,
  send_date date,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beta_onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  audience text not null default 'all' check (audience in ('all', 'readers', 'contributors', 'businesses', 'advertisers', 'staff')),
  status text not null default 'active' check (status in ('active', 'paused', 'done')),
  sort_order integer not null default 100,
  instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists beta_testers_status_idx on beta_testers(status);
create index if not exists beta_testers_role_idx on beta_testers(role);
create index if not exists beta_testers_priority_idx on beta_testers(priority);
create index if not exists beta_testers_created_at_idx on beta_testers(created_at desc);
create index if not exists beta_invite_batches_status_idx on beta_invite_batches(status);
create index if not exists beta_onboarding_tasks_sort_idx on beta_onboarding_tasks(sort_order, created_at desc);

insert into beta_onboarding_tasks (title, audience, status, sort_order, instructions)
values
  ('Open the homepage on mobile and desktop', 'all', 'active', 10, 'Check whether the front page feels local, readable, and current.'),
  ('Read two articles and report friction', 'readers', 'active', 20, 'Look for broken images, confusing bylines, awkward layout, or missing context.'),
  ('Submit one community item', 'readers', 'active', 30, 'Try an event, notice, tip, photo, or reader report form.'),
  ('Run one story through preflight', 'contributors', 'active', 40, 'Confirm title, slug, featured image, alt text, credit, SEO summary, and publish status.'),
  ('Review advertiser/business placement options', 'businesses', 'active', 50, 'Check whether business directory, deals, sponsored content, and ad pages make sense.'),
  ('Send feedback through the beta form', 'all', 'active', 60, 'Use the feedback form so the team can triage issues from one queue.')
on conflict do nothing;

insert into beta_invite_batches (title, audience, status, target_count, owner, message)
values
  ('Founding reader beta group', 'readers', 'draft', 25, null, 'Invite trusted readers across island communities to test the site on phones and desktops.'),
  ('Contributor workflow preview', 'contributors', 'draft', 10, null, 'Invite writers and editors to test story submission, preflight, media and publishing workflows.'),
  ('Business and advertiser preview', 'businesses', 'draft', 10, null, 'Invite local businesses to review listings, advertiser pages, sponsored content and beta messaging.')
on conflict do nothing;
