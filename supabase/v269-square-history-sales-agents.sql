-- HGN v0.51.6: Square historical archive and resumable backfill tracking
-- Run once in Supabase SQL Editor after v268.

create table if not exists public.hgn_square_customers (
  square_customer_id text primary key,
  company_name text,
  given_name text,
  family_name text,
  email_address text,
  phone_number text,
  reference_id text,
  created_at_square timestamptz,
  updated_at_square timestamptz,
  raw_data jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.hgn_square_invoices (
  square_invoice_id text primary key,
  square_order_id text,
  square_customer_id text,
  invoice_number text,
  title text,
  status text,
  location_id text,
  invoice_date date,
  due_date date,
  amount_requested numeric(12,2) not null default 0,
  currency text not null default 'CAD',
  raw_data jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.hgn_square_orders (
  square_order_id text primary key,
  square_customer_id text,
  location_id text,
  state text,
  created_at_square timestamptz,
  updated_at_square timestamptz,
  closed_at_square timestamptz,
  total_amount numeric(12,2) not null default 0,
  total_tax numeric(12,2) not null default 0,
  total_discount numeric(12,2) not null default 0,
  currency text not null default 'CAD',
  description text,
  raw_data jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.hgn_square_backfill_runs (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  status text not null default 'running',
  months_total integer not null default 0,
  months_completed integer not null default 0,
  payments_checked integer not null default 0,
  invoices_checked integer not null default 0,
  orders_checked integer not null default 0,
  customers_checked integer not null default 0,
  last_period text,
  last_error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null
);

alter table public.hgn_square_customers enable row level security;
alter table public.hgn_square_invoices enable row level security;
alter table public.hgn_square_orders enable row level security;
alter table public.hgn_square_backfill_runs enable row level security;

do $$
declare t text;
begin
  foreach t in array array['hgn_square_customers','hgn_square_invoices','hgn_square_orders','hgn_square_backfill_runs'] loop
    execute format('drop policy if exists "HGN publisher operations access" on public.%I', t);
    execute format($p$
      create policy "HGN publisher operations access" on public.%I
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
