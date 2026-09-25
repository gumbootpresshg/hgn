-- HGN v0.66.5: privacy-conscious public publishing analytics.
-- This stores anonymous, aggregate-friendly event rows only. It stores no email,
-- IP address, user-agent, billing, CRM, Operations, or individual-reader data.

create extension if not exists pgcrypto;

create table if not exists public.hgn_public_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  page_path text not null,
  article_id uuid null,
  article_slug text null,
  ad_id uuid null,
  placement_key text null,
  source text null,
  occurred_at timestamptz not null default now()
);

alter table public.hgn_public_analytics_events add column if not exists event_type text;
alter table public.hgn_public_analytics_events add column if not exists page_path text;
alter table public.hgn_public_analytics_events add column if not exists article_id uuid;
alter table public.hgn_public_analytics_events add column if not exists article_slug text;
alter table public.hgn_public_analytics_events add column if not exists ad_id uuid;
alter table public.hgn_public_analytics_events add column if not exists placement_key text;
alter table public.hgn_public_analytics_events add column if not exists source text;
alter table public.hgn_public_analytics_events add column if not exists occurred_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'hgn_public_analytics_events_event_type_check') then
    alter table public.hgn_public_analytics_events
      add constraint hgn_public_analytics_events_event_type_check
      check (event_type in ('article_view', 'ad_impression', 'ad_click', 'newsletter_signup', 'support_click', 'marketplace_lead', 'event_interest', 'search_submit'));
  end if;
end $$;

create index if not exists idx_hgn_public_analytics_events_occurred_at on public.hgn_public_analytics_events (occurred_at desc);
create index if not exists idx_hgn_public_analytics_events_type_occurred on public.hgn_public_analytics_events (event_type, occurred_at desc);
create index if not exists idx_hgn_public_analytics_events_article_slug on public.hgn_public_analytics_events (article_slug, occurred_at desc) where article_slug is not null;
create index if not exists idx_hgn_public_analytics_events_ad_id on public.hgn_public_analytics_events (ad_id, occurred_at desc) where ad_id is not null;

alter table public.hgn_public_analytics_events enable row level security;

-- Browser traffic goes through the validated server endpoint. No anonymous or
-- authenticated direct reads are granted; publisher-only reports use service role.
drop policy if exists "hgn_public_analytics_events_public_read" on public.hgn_public_analytics_events;
drop policy if exists "hgn_public_analytics_events_public_write" on public.hgn_public_analytics_events;
drop policy if exists "hgn_public_analytics_events_authenticated_read" on public.hgn_public_analytics_events;
drop policy if exists "hgn_public_analytics_events_authenticated_manage" on public.hgn_public_analytics_events;
