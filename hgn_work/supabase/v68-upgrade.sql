-- HGN v68 upgrade: Beta Launch Room
-- Adds launch decision history, release tasks, and beta communications queue.

create table if not exists beta_launch_decisions (
  id uuid primary key default gen_random_uuid(),
  decision text not null default 'watch' check (decision in ('go', 'watch', 'no_go')),
  decision_date date not null default current_date,
  decided_by text,
  readiness_score integer not null default 0,
  blockers_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists beta_release_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'Launch',
  owner text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'blocked', 'done', 'complete')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'critical')),
  due_date date,
  notes text,
  sort_order integer not null default 100,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beta_comms_queue (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  channel text not null default 'newsletter' check (channel in ('newsletter', 'social', 'site-banner', 'direct', 'print', 'other')),
  audience text not null default 'beta-readers' check (audience in ('beta-readers', 'contributors', 'advertisers', 'public', 'internal')),
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'scheduled', 'sent', 'cancelled')),
  send_at timestamptz,
  sent_at timestamptz,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists beta_launch_decisions_created_at_idx on beta_launch_decisions(created_at desc);
create index if not exists beta_release_tasks_status_idx on beta_release_tasks(status);
create index if not exists beta_release_tasks_sort_order_idx on beta_release_tasks(sort_order, created_at desc);
create index if not exists beta_comms_queue_send_at_idx on beta_comms_queue(send_at desc nulls last);
create index if not exists beta_comms_queue_status_idx on beta_comms_queue(status);

insert into beta_release_tasks (title, area, owner, status, priority, sort_order, notes)
values
  ('Confirm homepage works on phone, tablet and desktop', 'QA', null, 'pending', 'critical', 10, 'Check hero, nav, story cards, newsletter signup and local utility sections.'),
  ('Publish at least five credible beta stories', 'Editorial', null, 'pending', 'high', 20, 'Use the preflight desk before publishing.'),
  ('Resolve all red beta site checks', 'Operations', null, 'pending', 'critical', 30, 'Use Beta Ops to move every red check to green or documented watch.'),
  ('Prepare closed beta invite message', 'Comms', null, 'pending', 'high', 40, 'Draft the message for trusted testers and contributors.'),
  ('Confirm public beta status page is safe to share', 'Comms', null, 'pending', 'normal', 50, 'Only public-facing known issues and release notes should appear.'),
  ('Record first go/no-go decision', 'Launch', null, 'pending', 'high', 60, 'Use /admin/launch-room after final checks.')
on conflict do nothing;

insert into beta_comms_queue (title, channel, audience, status, body)
values
  ('Closed beta invite', 'newsletter', 'beta-readers', 'draft', 'Invite trusted readers to test HGN, report bugs, and help shape the local news platform.'),
  ('Contributor beta note', 'direct', 'contributors', 'draft', 'Explain how contributors should submit, review, and preflight stories during beta.'),
  ('Advertiser preview note', 'direct', 'advertisers', 'draft', 'Invite local advertisers to preview placements and give feedback before public beta.')
on conflict do nothing;
