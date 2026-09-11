-- HGN v164 - Submission Moderation Controls
-- Adds safe moderation support for approved/pending/rejected/deleted states.
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.classifieds add column if not exists status text default 'pending';
alter table public.classifieds add column if not exists admin_notes text;
alter table public.classifieds add column if not exists updated_at timestamptz default now();

alter table public.classified_submissions add column if not exists status text default 'pending';
alter table public.classified_submissions add column if not exists admin_notes text;
alter table public.classified_submissions add column if not exists updated_at timestamptz default now();

alter table public.submission_inbox add column if not exists status text default 'pending';
alter table public.submission_inbox add column if not exists admin_notes text;
alter table public.submission_inbox add column if not exists updated_at timestamptz default now();

alter table public.job_submissions add column if not exists status text default 'pending';
alter table public.job_submissions add column if not exists admin_notes text;
alter table public.job_submissions add column if not exists updated_at timestamptz default now();

-- Make authenticated admin/editor users able to update/delete during beta.
-- Tighten with role checks before full public launch if needed.

drop policy if exists authenticated_moderate_classifieds on public.classifieds;
create policy authenticated_moderate_classifieds on public.classifieds
for all to authenticated
using (true)
with check (true);

drop policy if exists authenticated_moderate_classified_submissions on public.classified_submissions;
create policy authenticated_moderate_classified_submissions on public.classified_submissions
for all to authenticated
using (true)
with check (true);

drop policy if exists authenticated_moderate_submission_inbox on public.submission_inbox;
create policy authenticated_moderate_submission_inbox on public.submission_inbox
for all to authenticated
using (true)
with check (true);

drop policy if exists authenticated_moderate_job_submissions on public.job_submissions;
create policy authenticated_moderate_job_submissions on public.job_submissions
for all to authenticated
using (true)
with check (true);

create index if not exists idx_classifieds_status_created
on public.classifieds (status, created_at desc);

create index if not exists idx_classified_submissions_status_created
on public.classified_submissions (status, created_at desc);

create index if not exists idx_submission_inbox_status_created
on public.submission_inbox (status, created_at desc);

create index if not exists idx_job_submissions_status_created
on public.job_submissions (status, created_at desc);
