-- HGN v87 - Moderation Desk
-- Community submission moderation, rule checks, escalation notes and public community standards.

create extension if not exists pgcrypto;

create table if not exists public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null default 'reader_submission',
  source_reference text,
  submitter_name text,
  submitter_contact text,
  status text not null default 'new',
  priority text not null default 'normal',
  risk_level text not null default 'low',
  assigned_to text,
  decision text,
  decision_reason text,
  internal_notes text,
  public_note text,
  due_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.moderation_cases add column if not exists title text;
alter table public.moderation_cases add column if not exists source_type text default 'reader_submission';
alter table public.moderation_cases add column if not exists source_reference text;
alter table public.moderation_cases add column if not exists submitter_name text;
alter table public.moderation_cases add column if not exists submitter_contact text;
alter table public.moderation_cases add column if not exists status text default 'new';
alter table public.moderation_cases add column if not exists priority text default 'normal';
alter table public.moderation_cases add column if not exists risk_level text default 'low';
alter table public.moderation_cases add column if not exists assigned_to text;
alter table public.moderation_cases add column if not exists decision text;
alter table public.moderation_cases add column if not exists decision_reason text;
alter table public.moderation_cases add column if not exists internal_notes text;
alter table public.moderation_cases add column if not exists public_note text;
alter table public.moderation_cases add column if not exists due_at timestamptz;
alter table public.moderation_cases add column if not exists decided_at timestamptz;
alter table public.moderation_cases add column if not exists created_at timestamptz default now();
alter table public.moderation_cases add column if not exists updated_at timestamptz default now();

create table if not exists public.moderation_rules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rule_area text not null default 'community',
  severity text not null default 'medium',
  status text not null default 'draft',
  public_summary text,
  internal_guidance text,
  reviewer text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.moderation_rules add column if not exists title text;
alter table public.moderation_rules add column if not exists rule_area text default 'community';
alter table public.moderation_rules add column if not exists severity text default 'medium';
alter table public.moderation_rules add column if not exists status text default 'draft';
alter table public.moderation_rules add column if not exists public_summary text;
alter table public.moderation_rules add column if not exists internal_guidance text;
alter table public.moderation_rules add column if not exists reviewer text;
alter table public.moderation_rules add column if not exists reviewed_at timestamptz;
alter table public.moderation_rules add column if not exists created_at timestamptz default now();
alter table public.moderation_rules add column if not exists updated_at timestamptz default now();

create table if not exists public.moderation_checks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.moderation_cases(id) on delete cascade,
  check_label text not null,
  check_area text not null default 'content',
  status text not null default 'pending',
  result text,
  checked_by text,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.moderation_checks add column if not exists case_id uuid references public.moderation_cases(id) on delete cascade;
alter table public.moderation_checks add column if not exists check_label text;
alter table public.moderation_checks add column if not exists check_area text default 'content';
alter table public.moderation_checks add column if not exists status text default 'pending';
alter table public.moderation_checks add column if not exists result text;
alter table public.moderation_checks add column if not exists checked_by text;
alter table public.moderation_checks add column if not exists checked_at timestamptz;
alter table public.moderation_checks add column if not exists created_at timestamptz default now();
alter table public.moderation_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.moderation_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  task_area text not null default 'moderation',
  status text not null default 'todo',
  priority text not null default 'normal',
  owner text,
  due_date date,
  success_criteria text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.moderation_tasks add column if not exists title text;
alter table public.moderation_tasks add column if not exists task_area text default 'moderation';
alter table public.moderation_tasks add column if not exists status text default 'todo';
alter table public.moderation_tasks add column if not exists priority text default 'normal';
alter table public.moderation_tasks add column if not exists owner text;
alter table public.moderation_tasks add column if not exists due_date date;
alter table public.moderation_tasks add column if not exists success_criteria text;
alter table public.moderation_tasks add column if not exists notes text;
alter table public.moderation_tasks add column if not exists completed_at timestamptz;
alter table public.moderation_tasks add column if not exists created_at timestamptz default now();
alter table public.moderation_tasks add column if not exists updated_at timestamptz default now();

create index if not exists idx_moderation_cases_status on public.moderation_cases(status);
create index if not exists idx_moderation_cases_priority on public.moderation_cases(priority);
create index if not exists idx_moderation_cases_risk on public.moderation_cases(risk_level);
create index if not exists idx_moderation_rules_status on public.moderation_rules(status);
create index if not exists idx_moderation_checks_case_id on public.moderation_checks(case_id);
create index if not exists idx_moderation_tasks_status on public.moderation_tasks(status);

insert into public.moderation_rules (title, rule_area, severity, status, public_summary, internal_guidance, reviewer)
select * from (values
  ('No personal attacks or harassment', 'community', 'high', 'active', 'We do not publish submissions that target, threaten or harass people.', 'Escalate high-risk cases before publishing. Consider whether edits can preserve the news value without harm.', 'Editor'),
  ('Claims need verification', 'accuracy', 'high', 'active', 'Submissions with factual claims may require source checks before publication.', 'Attach source notes or move to Source Desk when verification is needed.', 'Editor'),
  ('Privacy and youth protection', 'privacy', 'critical', 'active', 'We may hold or edit submissions that expose private information, especially about children or vulnerable people.', 'Do not publish private details without clear consent and editorial purpose.', 'Editor')
) as seed(title, rule_area, severity, status, public_summary, internal_guidance, reviewer)
where not exists (select 1 from public.moderation_rules);

insert into public.moderation_cases (title, source_type, source_reference, status, priority, risk_level, assigned_to, internal_notes, public_note)
select * from (values
  ('Beta reader report requiring source check', 'reader_report', 'Reader Reporter', 'reviewing', 'high', 'medium', 'Editor', 'Use this seed as the pattern for claims that need verification before publishing.', 'Thanks for the submission. We may follow up before publishing.'),
  ('Marketplace/community listing moderation sample', 'marketplace', 'Community Board', 'new', 'normal', 'low', 'Moderator', 'Check contact details, spam signals and category fit.', null)
) as seed(title, source_type, source_reference, status, priority, risk_level, assigned_to, internal_notes, public_note)
where not exists (select 1 from public.moderation_cases);

insert into public.moderation_tasks (title, task_area, status, priority, owner, success_criteria, notes)
select * from (values
  ('Write public community standards copy', 'public-policy', 'todo', 'high', 'Editor', 'Readers can understand what HGN will approve, edit or reject.', 'Connect this to the Community Standards page.'),
  ('Define escalation path for sensitive submissions', 'workflow', 'todo', 'urgent', 'Editor', 'Editors know when to hold, escalate or legal-review a submission.', 'Important before wider beta submissions.'),
  ('Test moderation flow with one event, one tip and one listing', 'qa', 'todo', 'normal', 'Editor', 'A moderator can triage common submissions in under five minutes.', 'Use beta testers to validate the workflow.')
) as seed(title, task_area, status, priority, owner, success_criteria, notes)
where not exists (select 1 from public.moderation_tasks);
