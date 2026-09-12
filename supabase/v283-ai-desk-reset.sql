-- HGN v0.62.0: AI Desk reset and research workflow
-- Run in the PUBLIC HGN Supabase project only.
-- Additive/non-destructive: preserves all existing AI Desk and event-source records.

alter table public.ai_desk_items
  add column if not exists origin text not null default 'manual',
  add column if not exists archived_at timestamptz;

alter table public.ai_desk_items drop constraint if exists ai_desk_status_check;
alter table public.ai_desk_items
  add constraint ai_desk_status_check
  check (status in ('pending','approved','rejected','completed','archived'));

update public.ai_desk_items
set origin = case
  when agent_name = 'AI Desk Event Finder' then 'ai_event_finder'
  when agent_name = 'Manual desk note' then 'manual'
  else 'legacy'
end
where origin is null or origin = '' or origin = 'manual';

create index if not exists ai_desk_items_origin_status_idx
  on public.ai_desk_items(origin, status, created_at desc);

alter table public.hgn_event_sources
  add column if not exists quality_score numeric(3,2) not null default 0.50,
  add column if not exists max_candidates integer not null default 8,
  add column if not exists last_candidate_count integer not null default 0,
  add column if not exists last_duplicate_count integer not null default 0;

do $$ begin
  alter table public.hgn_event_sources
    add constraint hgn_event_sources_quality_score_check
    check (quality_score >= 0 and quality_score <= 1);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.hgn_event_sources
    add constraint hgn_event_sources_max_candidates_check
    check (max_candidates between 3 and 12);
exception when duplicate_object then null; end $$;

comment on column public.ai_desk_items.origin is 'Origin of the research item, such as manual or ai_event_finder.';
comment on column public.ai_desk_items.archived_at is 'When the research item was archived from the active AI Desk.';
comment on column public.hgn_event_sources.quality_score is 'Editor-maintained source quality score used by Event Finder confidence scoring.';
comment on column public.hgn_event_sources.max_candidates is 'Maximum research candidates Event Finder may create from this source per scan.';
