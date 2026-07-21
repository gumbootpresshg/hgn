-- HGN v155 - Beta Feedback Loop
-- Defensive migration. Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.beta_feedback_loop (
  id uuid primary key default gen_random_uuid(),
  loop_key text not null,
  loop_label text not null,
  category text not null default 'feedback',
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.beta_feedback_loop add column if not exists loop_key text;
alter table public.beta_feedback_loop add column if not exists loop_label text;
alter table public.beta_feedback_loop add column if not exists category text default 'feedback';
alter table public.beta_feedback_loop add column if not exists status text default 'pending';
alter table public.beta_feedback_loop add column if not exists priority text default 'normal';
alter table public.beta_feedback_loop add column if not exists notes text;
alter table public.beta_feedback_loop add column if not exists created_at timestamptz default now();
alter table public.beta_feedback_loop add column if not exists updated_at timestamptz default now();

update public.beta_feedback_loop
   set loop_key = coalesce(loop_key, 'feedback_loop_' || left(md5(coalesce(id::text, now()::text)), 10)),
       loop_label = coalesce(loop_label, 'Beta feedback loop item'),
       category = coalesce(category, 'feedback'),
       status = coalesce(status, 'pending'),
       priority = coalesce(priority, 'normal'),
       updated_at = now()
 where loop_key is null
    or loop_label is null
    or category is null
    or status is null
    or priority is null;

alter table public.beta_feedback_loop alter column loop_key set not null;
alter table public.beta_feedback_loop alter column loop_label set not null;

insert into public.beta_feedback_loop (loop_key, loop_label, category, status, priority, notes)
select 'first_reader_feedback', 'First reader feedback', 'reader_feedback', 'pending', 'high',
       'Capture the first 3-5 reactions from real readers after sharing the beta link.'
where not exists (
  select 1 from public.beta_feedback_loop where loop_key = 'first_reader_feedback'
);

insert into public.beta_feedback_loop (loop_key, loop_label, category, status, priority, notes)
select 'bug_triage_window', 'Bug triage window', 'bugfix', 'pending', 'high',
       'Set aside a short window after sharing the beta link to fix obvious issues.'
where not exists (
  select 1 from public.beta_feedback_loop where loop_key = 'bug_triage_window'
);

insert into public.beta_feedback_loop (loop_key, loop_label, category, status, priority, notes)
select 'submission_alert_watch', 'Submission alert watch', 'submissions', 'pending', 'high',
       'Watch Letters to the Editor alerts and confirm nothing private is exposed publicly.'
where not exists (
  select 1 from public.beta_feedback_loop where loop_key = 'submission_alert_watch'
);

insert into public.beta_feedback_loop (loop_key, loop_label, category, status, priority, notes)
select 'homepage_after_feedback', 'Homepage after-feedback pass', 'homepage', 'ready', 'normal',
       'After early feedback, tune the homepage lead, section order, and stale items.'
where not exists (
  select 1 from public.beta_feedback_loop where loop_key = 'homepage_after_feedback'
);
