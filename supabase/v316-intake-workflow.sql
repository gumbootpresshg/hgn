-- HGN v0.67.31 — proper submission intake workflow.
-- Run once in the Supabase SQL Editor before using the upgraded intake screens.

alter table public.hgn_incoming_queue_state
  add column if not exists workflow_stage text;

alter table public.hgn_incoming_queue_state
  add column if not exists started_at timestamptz;

alter table public.hgn_incoming_queue_state
  add column if not exists completed_at timestamptz;

update public.hgn_incoming_queue_state
set workflow_stage = case
  when queue_state = 'deleted' then 'deleted'
  when queue_state = 'archived' then 'archived'
  when reviewed_at is not null then 'in_progress'
  else 'new'
end
where workflow_stage is null;

alter table public.hgn_incoming_queue_state
  alter column workflow_stage set default 'new';

alter table public.hgn_incoming_queue_state
  alter column workflow_stage set not null;

alter table public.hgn_incoming_queue_state
  drop constraint if exists hgn_incoming_queue_state_workflow_stage_check;

alter table public.hgn_incoming_queue_state
  add constraint hgn_incoming_queue_state_workflow_stage_check
  check (workflow_stage in ('new', 'in_progress', 'done', 'archived', 'deleted'));

create index if not exists hgn_incoming_queue_state_workflow_stage_idx
  on public.hgn_incoming_queue_state (workflow_stage, updated_at desc);
