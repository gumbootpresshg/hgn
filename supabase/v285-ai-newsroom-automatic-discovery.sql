-- HGN v0.64.0: AI newsroom simplification + automatic local event discovery
-- Run in the PUBLIC HGN Supabase project only. Additive/non-destructive.

create table if not exists public.hgn_ai_discovery_settings (
  singleton_key text primary key default 'default',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

insert into public.hgn_ai_discovery_settings(singleton_key, settings)
values ('default', jsonb_build_object(
  'enabled', true,
  'publication_area', 'Haida Gwaii',
  'communities', jsonb_build_array('Masset','Old Massett','Port Clements','Tlell','Skidegate','Daajing Giids','Sandspit','Moresby Island','Graham Island'),
  'event_types', jsonb_build_array('community events','festivals','markets','fundraisers','sports','school events','arts','concerts','workshops','meetings','recreation','fairs','cultural events','business events'),
  'organizations', jsonb_build_array('Village of Masset','Village of Daajing Giids','Village of Port Clements','Old Massett Village Council','Skidegate Band Council','School District 50','Haida Heritage Centre'),
  'custom_terms', '[]'::jsonb,
  'excluded_terms', '[]'::jsonb,
  'lookahead_days', 90
)) on conflict (singleton_key) do nothing;

alter table public.hgn_ai_discovery_settings enable row level security;

alter table public.hgn_event_sources
  add column if not exists auto_managed boolean not null default false,
  add column if not exists consecutive_failures integer not null default 0,
  add column if not exists successful_scans integer not null default 0,
  add column if not exists last_useful_at timestamptz;

create index if not exists hgn_event_sources_auto_health_idx
  on public.hgn_event_sources(auto_managed, active, quality_score desc);

comment on table public.hgn_ai_discovery_settings is 'Publisher-controlled coverage settings used by automatic AI newsroom discovery.';
comment on column public.hgn_event_sources.auto_managed is 'True when source discovery and health are managed automatically by AI Desk.';
