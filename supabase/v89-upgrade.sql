-- HGN v89 - Two-person Daily Operator Desk
-- Focus: simplify the beta workflow for the founder + editor.

create extension if not exists pgcrypto;

create table if not exists daily_operator_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null default current_date,
  shift_label text not null default 'Daily desk',
  editor_on_duty text,
  founder_on_duty text,
  publishing_goal text,
  homepage_goal text,
  newsletter_goal text,
  status text not null default 'open',
  readiness_score integer not null default 50 check (readiness_score >= 0 and readiness_score <= 100),
  blockers text,
  handoff_notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists daily_operator_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references daily_operator_runs(id) on delete cascade,
  task_title text not null,
  task_area text not null default 'publishing',
  owner text,
  priority text not null default 'normal',
  status text not null default 'todo',
  due_today boolean not null default true,
  article_slug text,
  next_step text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists daily_operator_handoffs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references daily_operator_runs(id) on delete cascade,
  from_person text,
  to_person text,
  subject text not null,
  note text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists daily_focus_slots (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references daily_operator_runs(id) on delete cascade,
  slot_name text not null,
  slot_order integer not null default 0,
  story_title text,
  article_slug text,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_operator_runs_date_idx on daily_operator_runs(run_date desc);
create index if not exists daily_operator_tasks_run_idx on daily_operator_tasks(run_id, status, priority);
create index if not exists daily_operator_handoffs_run_idx on daily_operator_handoffs(run_id, status);
create index if not exists daily_focus_slots_run_idx on daily_focus_slots(run_id, slot_order);

insert into daily_operator_runs (run_date, shift_label, editor_on_duty, founder_on_duty, publishing_goal, homepage_goal, newsletter_goal, status, readiness_score)
select current_date, 'Two-person beta desk', 'Editor', 'Founder', 'Get one clean story or update ready to publish', 'Make the homepage feel current', 'Only send if the story mix is strong enough', 'open', 62
where not exists (select 1 from daily_operator_runs where run_date = current_date);

insert into daily_operator_tasks (task_title, task_area, owner, priority, status, next_step)
select * from (values
  ('Pick the one story that matters most today', 'publishing', 'Founder + Editor', 'high', 'todo', 'Choose the top story before adding anything else.'),
  ('Check headline, image, credit, alt text and SEO before publishing', 'preflight', 'Editor', 'high', 'todo', 'Use the editor workbench/preflight before pushing live.'),
  ('Refresh the homepage lead and utility links', 'homepage', 'Founder', 'normal', 'todo', 'Make the front page look alive for today.'),
  ('Write the handoff note for the next session', 'handoff', 'Founder + Editor', 'normal', 'todo', 'Capture what is done, blocked and next.')
) as seed(task_title, task_area, owner, priority, status, next_step)
where not exists (select 1 from daily_operator_tasks where task_title = seed.task_title);

insert into daily_focus_slots (slot_name, slot_order, status, notes)
select * from (values
  ('Lead story', 1, 'planned', 'The main story/update visitors should see first.'),
  ('Secondary story', 2, 'planned', 'Useful backup item if there is no full new article.'),
  ('Community utility', 3, 'planned', 'Weather, ferry, emergency, event, notice or service item.'),
  ('Newsletter/social prompt', 4, 'planned', 'What should be shared if there is enough value today?')
) as seed(slot_name, slot_order, status, notes)
where not exists (select 1 from daily_focus_slots where slot_name = seed.slot_name);
