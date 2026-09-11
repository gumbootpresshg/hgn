-- HGN v0.51.4: historical payment imports and external integration tracking
-- Run once in Supabase SQL Editor.

create table if not exists public.hgn_external_transactions (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  transaction_date timestamptz,
  payer_name text,
  payer_email text,
  transaction_type text,
  status text,
  description text,
  gross_amount numeric(12,2) not null default 0,
  fee_amount numeric(12,2) not null default 0,
  net_amount numeric(12,2) not null default 0,
  currency text not null default 'CAD',
  customer_id uuid references public.hgn_customers(id) on delete set null,
  billing_item_id uuid references public.hgn_billing_items(id) on delete set null,
  imported_from text,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hgn_external_provider_check check (provider in ('square','paypal','patreon','other')),
  unique(provider, external_id)
);

create table if not exists public.hgn_integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  enabled boolean not null default false,
  connection_status text not null default 'not_configured',
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hgn_integration_provider_check check (provider in ('square','paypal','patreon'))
);

create index if not exists hgn_external_provider_date_idx on public.hgn_external_transactions(provider, transaction_date desc);
create index if not exists hgn_external_match_idx on public.hgn_external_transactions(customer_id, billing_item_id);

alter table public.hgn_external_transactions enable row level security;
alter table public.hgn_integrations enable row level security;

do $$
declare t text;
begin
  foreach t in array array['hgn_external_transactions','hgn_integrations'] loop
    execute format('drop policy if exists "HGN publisher operations access" on public.%I', t);
    execute format($p$
      create policy "HGN publisher operations access" on public.%I
      for all to authenticated
      using (exists (
        select 1 from public.hgn_profiles p
        where p.user_id = auth.uid()
          and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor'))
      ))
      with check (exists (
        select 1 from public.hgn_profiles p
        where p.user_id = auth.uid()
          and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor'))
      ))
    $p$, t);
  end loop;
end $$;

insert into public.hgn_integrations(provider)
values ('square'),('paypal'),('patreon')
on conflict (provider) do nothing;

comment on table public.hgn_external_transactions is 'Historical and synchronized transactions imported from Square, PayPal, Patreon and other sources.';
