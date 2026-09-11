-- HGN v0.51.0: AI Desk review queue foundation
-- Run once in Supabase SQL Editor before using Admin -> AI Desk.

create table if not exists public.ai_desk_items (
  id uuid primary key default gen_random_uuid(),
  item_type text not null default 'guide_update',
  title text not null,
  summary text,
  proposed_action text,
  source_name text,
  source_url text,
  source_published_at timestamptz,
  confidence numeric(4,3),
  priority text not null default 'normal',
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  agent_name text,
  dedupe_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  constraint ai_desk_status_check check (status in ('pending','approved','rejected','completed')),
  constraint ai_desk_priority_check check (priority in ('low','normal','high','urgent')),
  constraint ai_desk_confidence_check check (confidence is null or (confidence >= 0 and confidence <= 1))
);

create index if not exists ai_desk_items_status_created_idx on public.ai_desk_items(status, created_at desc);
create index if not exists ai_desk_items_type_created_idx on public.ai_desk_items(item_type, created_at desc);

alter table public.ai_desk_items enable row level security;

drop policy if exists "HGN editors can manage AI Desk" on public.ai_desk_items;
create policy "HGN editors can manage AI Desk"
on public.ai_desk_items for all to authenticated
using (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid()
    and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
)
with check (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid()
    and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor')))
);

comment on table public.ai_desk_items is 'Human-reviewed queue for HGN guide updates, news leads, events, site checks and future automated agents.';
