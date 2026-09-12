-- HGN v0.63.0: reusable site configuration + AI event source discovery
-- Run in the PUBLIC HGN Supabase project only. Additive/non-destructive.

create table if not exists public.hgn_site_platform_settings (
  singleton_key text primary key default 'default',
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

insert into public.hgn_site_platform_settings(singleton_key, config)
values ('default', '{}'::jsonb)
on conflict (singleton_key) do nothing;

alter table public.hgn_site_platform_settings enable row level security;

drop policy if exists "site platform settings public read" on public.hgn_site_platform_settings;
create policy "site platform settings public read" on public.hgn_site_platform_settings
for select using (true);

alter table public.hgn_event_sources
  add column if not exists source_lifecycle text not null default 'trusted',
  add column if not exists review_status text not null default 'approved',
  add column if not exists discovered_at timestamptz,
  add column if not exists discovered_query text,
  add column if not exists discovery_note text,
  add column if not exists last_discovered_at timestamptz;

do $$ begin
  alter table public.hgn_event_sources add constraint hgn_event_sources_lifecycle_check
    check (source_lifecycle in ('candidate','trusted','watch','one_time','ignored'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.hgn_event_sources add constraint hgn_event_sources_review_check
    check (review_status in ('candidate','approved','ignored'));
exception when duplicate_object then null; end $$;

create index if not exists hgn_event_sources_review_lifecycle_idx
  on public.hgn_event_sources(review_status, source_lifecycle, active);

comment on column public.hgn_event_sources.source_lifecycle is 'candidate, trusted, watch, one_time, or ignored';
comment on column public.hgn_event_sources.review_status is 'editorial review state for discovered sources';
comment on table public.hgn_site_platform_settings is 'Publication-level navigation, sections, features and visibility configuration.';
