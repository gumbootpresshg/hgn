-- HGN v0.61.7 - recoverable admin state for the unified incoming queue.
-- Public HGN Supabase project only. Additive; does not delete source submissions.

create table if not exists public.hgn_incoming_queue_state (
  source_table text not null,
  source_id text not null,
  queue_state text not null default 'active' check (queue_state in ('active','archived','deleted')),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by text,
  primary key (source_table, source_id)
);

alter table public.hgn_incoming_queue_state enable row level security;

-- Queue state is managed only through authenticated server-side admin APIs.
-- Service-role access bypasses RLS; no browser-facing policies are created here.

create index if not exists hgn_incoming_queue_state_queue_state_idx
  on public.hgn_incoming_queue_state (queue_state, updated_at desc);
