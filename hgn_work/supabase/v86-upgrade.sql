-- HGN v86 - Training Desk
-- Staff/contributor onboarding, beta training modules, resource library and launch training tasks.

create extension if not exists pgcrypto;

create table if not exists public.training_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  module_area text not null default 'newsroom',
  audience text not null default 'contributors',
  status text not null default 'draft',
  priority text not null default 'normal',
  owner text,
  estimated_minutes integer default 15,
  checklist text,
  notes text,
  published_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.training_modules add column if not exists title text;
alter table public.training_modules add column if not exists module_area text default 'newsroom';
alter table public.training_modules add column if not exists audience text default 'contributors';
alter table public.training_modules add column if not exists status text default 'draft';
alter table public.training_modules add column if not exists priority text default 'normal';
alter table public.training_modules add column if not exists owner text;
alter table public.training_modules add column if not exists estimated_minutes integer default 15;
alter table public.training_modules add column if not exists checklist text;
alter table public.training_modules add column if not exists notes text;
alter table public.training_modules add column if not exists published_at timestamptz;
alter table public.training_modules add column if not exists completed_at timestamptz;
alter table public.training_modules add column if not exists created_at timestamptz default now();
alter table public.training_modules add column if not exists updated_at timestamptz default now();

create table if not exists public.staff_onboarding_runs (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  person_contact text,
  role_name text not null default 'contributor',
  status text not null default 'invited',
  training_stage text not null default 'orientation',
  assigned_modules text,
  completed_modules integer default 0,
  total_modules integer default 0,
  owner text,
  target_date date,
  last_contacted_at timestamptz,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_onboarding_runs add column if not exists person_name text;
alter table public.staff_onboarding_runs add column if not exists person_contact text;
alter table public.staff_onboarding_runs add column if not exists role_name text default 'contributor';
alter table public.staff_onboarding_runs add column if not exists status text default 'invited';
alter table public.staff_onboarding_runs add column if not exists training_stage text default 'orientation';
alter table public.staff_onboarding_runs add column if not exists assigned_modules text;
alter table public.staff_onboarding_runs add column if not exists completed_modules integer default 0;
alter table public.staff_onboarding_runs add column if not exists total_modules integer default 0;
alter table public.staff_onboarding_runs add column if not exists owner text;
alter table public.staff_onboarding_runs add column if not exists target_date date;
alter table public.staff_onboarding_runs add column if not exists last_contacted_at timestamptz;
alter table public.staff_onboarding_runs add column if not exists notes text;
alter table public.staff_onboarding_runs add column if not exists completed_at timestamptz;
alter table public.staff_onboarding_runs add column if not exists created_at timestamptz default now();
alter table public.staff_onboarding_runs add column if not exists updated_at timestamptz default now();

create table if not exists public.training_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  resource_type text not null default 'guide',
  resource_url text,
  audience text not null default 'contributors',
  status text not null default 'draft',
  owner text,
  summary text,
  related_module text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.training_resources add column if not exists title text;
alter table public.training_resources add column if not exists resource_type text default 'guide';
alter table public.training_resources add column if not exists resource_url text;
alter table public.training_resources add column if not exists audience text default 'contributors';
alter table public.training_resources add column if not exists status text default 'draft';
alter table public.training_resources add column if not exists owner text;
alter table public.training_resources add column if not exists summary text;
alter table public.training_resources add column if not exists related_module text;
alter table public.training_resources add column if not exists reviewed_at timestamptz;
alter table public.training_resources add column if not exists created_at timestamptz default now();
alter table public.training_resources add column if not exists updated_at timestamptz default now();

create table if not exists public.beta_training_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  task_area text not null default 'training',
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

alter table public.beta_training_tasks add column if not exists title text;
alter table public.beta_training_tasks add column if not exists task_area text default 'training';
alter table public.beta_training_tasks add column if not exists status text default 'todo';
alter table public.beta_training_tasks add column if not exists priority text default 'normal';
alter table public.beta_training_tasks add column if not exists owner text;
alter table public.beta_training_tasks add column if not exists due_date date;
alter table public.beta_training_tasks add column if not exists success_criteria text;
alter table public.beta_training_tasks add column if not exists notes text;
alter table public.beta_training_tasks add column if not exists completed_at timestamptz;
alter table public.beta_training_tasks add column if not exists created_at timestamptz default now();
alter table public.beta_training_tasks add column if not exists updated_at timestamptz default now();

create index if not exists idx_training_modules_status on public.training_modules(status);
create index if not exists idx_training_modules_area on public.training_modules(module_area);
create index if not exists idx_staff_onboarding_status on public.staff_onboarding_runs(status);
create index if not exists idx_training_resources_status on public.training_resources(status);
create index if not exists idx_beta_training_tasks_status on public.beta_training_tasks(status);

insert into public.training_modules (title, module_area, audience, status, priority, owner, estimated_minutes, checklist, notes)
select * from (values
  ('Publishing basics for beta contributors', 'publishing', 'contributors', 'ready', 'high', 'Editor', 25, 'Draft a story; add image credit; preview; submit for review', 'Core contributor onboarding before public beta.'),
  ('Corrections, rights and trust workflow', 'trust', 'editors', 'draft', 'high', 'Editor', 20, 'Correction request; source note; rights check; public trust log', 'Connects the Trust Desk and Rights Desk.'),
  ('Emergency update publishing drill', 'emergency', 'admins', 'draft', 'urgent', 'Editor', 15, 'Create update; verify official contact; publish; archive', 'Needed before launch because emergency pages are public-facing.')
) as seed(title, module_area, audience, status, priority, owner, estimated_minutes, checklist, notes)
where not exists (select 1 from public.training_modules);

insert into public.training_resources (title, resource_type, audience, status, owner, summary, related_module)
select * from (values
  ('HGN beta contributor quickstart', 'guide', 'contributors', 'draft', 'Editor', 'One-page guide for submitting clean copy, photos and credits.', 'Publishing basics for beta contributors'),
  ('Admin desk map', 'checklist', 'admins', 'draft', 'Editor', 'Which admin desk owns each beta workflow.', 'Publishing basics for beta contributors'),
  ('Community standards explainer', 'policy', 'readers', 'draft', 'Editor', 'Plain-language public page for submissions, corrections and moderation.', 'Corrections, rights and trust workflow')
) as seed(title, resource_type, audience, status, owner, summary, related_module)
where not exists (select 1 from public.training_resources);

insert into public.beta_training_tasks (title, task_area, status, priority, owner, success_criteria, notes)
select * from (values
  ('Run one contributor publishing walkthrough', 'contributors', 'todo', 'high', 'Editor', 'A new contributor can submit a usable story without help.', 'Do this before expanding tester invites.'),
  ('Record admin handoff checklist', 'admin', 'todo', 'normal', 'Editor', 'Any admin can find the correct desk and next action.', 'Useful for beta coverage gaps.'),
  ('Prepare public beta help copy', 'reader-help', 'todo', 'normal', 'Editor', 'Readers know how to report bugs, request corrections and submit stories.', 'Connect to beta updates and trust pages.')
) as seed(title, task_area, status, priority, owner, success_criteria, notes)
where not exists (select 1 from public.beta_training_tasks);
