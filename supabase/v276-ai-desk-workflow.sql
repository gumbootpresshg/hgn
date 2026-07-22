-- HGN v0.56.0: AI Desk newsroom workflow
-- Run once in Supabase SQL Editor after v275.

alter table public.ai_desk_items
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists due_at timestamptz,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists related_record_type text,
  add column if not exists related_record_id uuid,
  add column if not exists related_record_url text,
  add column if not exists completed_action text,
  add column if not exists last_action_at timestamptz;

do $$ begin
  alter table public.ai_desk_items add constraint ai_desk_verification_check
    check (verification_status in ('unverified','needs_check','verified','disputed'));
exception when duplicate_object then null; end $$;

create index if not exists ai_desk_items_assignment_idx on public.ai_desk_items(assigned_to, status, due_at);
create index if not exists ai_desk_items_verification_idx on public.ai_desk_items(verification_status, status);

create table if not exists public.ai_desk_comments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.ai_desk_items(id) on delete cascade,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_desk_activity (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.ai_desk_items(id) on delete cascade,
  action text not null,
  detail text,
  actor_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_desk_comments_item_idx on public.ai_desk_comments(item_id, created_at);
create index if not exists ai_desk_activity_item_idx on public.ai_desk_activity(item_id, created_at desc);

alter table public.ai_desk_comments enable row level security;
alter table public.ai_desk_activity enable row level security;

do $$
declare t text;
begin
  foreach t in array array['ai_desk_comments','ai_desk_activity'] loop
    execute format('drop policy if exists "HGN AI Desk workflow access" on public.%I', t);
    execute format($p$
      create policy "HGN AI Desk workflow access" on public.%I
      for all to authenticated
      using (exists (
        select 1 from public.hgn_profiles p where p.user_id = auth.uid()
          and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor'))
      ))
      with check (exists (
        select 1 from public.hgn_profiles p where p.user_id = auth.uid()
          and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor'))
      ))
    $p$, t);
  end loop;
end $$;

comment on table public.ai_desk_comments is 'Internal newsroom notes attached to AI Desk items.';
comment on table public.ai_desk_activity is 'Auditable history of human review and controlled actions in the AI Desk.';
