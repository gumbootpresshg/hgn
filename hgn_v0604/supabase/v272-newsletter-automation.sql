-- HGN v0.52.1: newsletter automation, preferences and delivery history
-- Safe additive migration. Run after v271.

create extension if not exists pgcrypto;

create table if not exists public.hgn_newsletter_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null default 'default' unique,
  mode text not null default 'manual' check (mode in ('manual','automatic')),
  automatic_action text not null default 'build_for_approval' check (automatic_action in ('build_for_approval','build_and_send')),
  frequency_days integer not null default 14 check (frequency_days between 1 and 90),
  send_weekday integer not null default 4 check (send_weekday between 0 and 6),
  send_hour integer not null default 9 check (send_hour between 0 and 23),
  timezone text not null default 'America/Vancouver',
  lookback_days integer not null default 14 check (lookback_days between 1 and 90),
  max_stories integer not null default 12 check (max_stories between 1 and 40),
  require_approval boolean not null default true,
  include_events boolean not null default true,
  include_weather boolean not null default true,
  include_ferry boolean not null default true,
  include_marketplace boolean not null default false,
  include_obituaries boolean not null default true,
  include_opinion boolean not null default true,
  include_guide boolean not null default true,
  from_name text not null default 'Haida Gwaii News',
  from_email text not null default 'newsletter@haidagwaiinews.com',
  reply_to text,
  test_email text,
  editor_intro_prompt text,
  last_built_at timestamptz,
  last_sent_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.hgn_newsletter_settings (singleton_key)
values ('default') on conflict (singleton_key) do nothing;

alter table public.subscribers add column if not exists frequency text not null default 'biweekly';
alter table public.subscribers add column if not exists consent_source text;
alter table public.subscribers add column if not exists preference_token uuid default gen_random_uuid();
alter table public.subscribers add column if not exists unsubscribed_at timestamptz;
alter table public.subscribers add column if not exists last_sent_at timestamptz;
alter table public.subscribers add column if not exists send_count integer not null default 0;
alter table public.subscribers add column if not exists updated_at timestamptz not null default now();
create unique index if not exists subscribers_preference_token_unique on public.subscribers(preference_token);

alter table public.newsletter_editions add column if not exists content_json jsonb not null default '{}'::jsonb;
alter table public.newsletter_editions add column if not exists recipient_count integer not null default 0;
alter table public.newsletter_editions add column if not exists delivered_count integer not null default 0;
alter table public.newsletter_editions add column if not exists failed_count integer not null default 0;
alter table public.newsletter_editions add column if not exists date_from date;
alter table public.newsletter_editions add column if not exists date_to date;
alter table public.newsletter_editions add column if not exists build_source text not null default 'manual';
alter table public.newsletter_editions add column if not exists resend_batch_ids jsonb not null default '[]'::jsonb;

create table if not exists public.hgn_newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.newsletter_editions(id) on delete cascade,
  subscriber_id uuid references public.subscribers(id) on delete set null,
  email text not null,
  segment_key text,
  status text not null default 'queued' check (status in ('queued','sent','failed','delivered','bounced','complained','unsubscribed')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(edition_id,email)
);
create index if not exists hgn_newsletter_deliveries_edition_idx on public.hgn_newsletter_deliveries(edition_id,status);

alter table public.hgn_newsletter_settings enable row level security;
alter table public.hgn_newsletter_deliveries enable row level security;

-- Publisher/editor access uses the current HGN profile model.
drop policy if exists "publisher manage newsletter settings" on public.hgn_newsletter_settings;
create policy "publisher manage newsletter settings" on public.hgn_newsletter_settings
for all to authenticated
using (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or lower(coalesce(p.account_type,'')) in ('admin','administrator','publisher','editor','newsroom','super_admin','superadmin'))))
with check (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or lower(coalesce(p.account_type,'')) in ('admin','administrator','publisher','editor','newsroom','super_admin','superadmin'))));

drop policy if exists "publisher manage newsletter deliveries" on public.hgn_newsletter_deliveries;
create policy "publisher manage newsletter deliveries" on public.hgn_newsletter_deliveries
for all to authenticated
using (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or lower(coalesce(p.account_type,'')) in ('admin','administrator','publisher','editor','newsroom','super_admin','superadmin'))))
with check (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or lower(coalesce(p.account_type,'')) in ('admin','administrator','publisher','editor','newsroom','super_admin','superadmin'))));
