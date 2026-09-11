-- HGN v0.51.1: advertising, billing, sales and AI Desk expansion
-- Run once in Supabase SQL Editor.

create table if not exists public.hgn_customers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  email text,
  phone text,
  mailing_address text,
  preferred_contact text not null default 'email',
  default_ad_size text,
  default_price numeric(12,2),
  payment_terms text not null default 'due_on_receipt',
  square_customer_id text,
  standing_advertiser boolean not null default false,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hgn_billing_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.hgn_customers(id) on delete restrict,
  billing_period text,
  issues_covered text,
  ad_size text,
  amount numeric(12,2) not null default 0,
  due_date date,
  invoice_status text not null default 'not_invoiced',
  invoice_date date,
  invoice_number text,
  square_invoice_id text,
  payment_status text not null default 'unpaid',
  payment_method text,
  payment_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hgn_billing_invoice_status_check check (invoice_status in ('not_invoiced','sent','cancelled')),
  constraint hgn_billing_payment_status_check check (payment_status in ('unpaid','partial','paid','written_off'))
);

create table if not exists public.hgn_payments (
  id uuid primary key default gen_random_uuid(),
  billing_item_id uuid references public.hgn_billing_items(id) on delete set null,
  customer_id uuid not null references public.hgn_customers(id) on delete restrict,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  payment_method text not null,
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.hgn_sales_leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  email text,
  phone text,
  source text,
  stage text not null default 'new',
  estimated_value numeric(12,2),
  last_contact_at timestamptz,
  next_follow_up date,
  preferred_contact text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hgn_sales_stage_check check (stage in ('new','contacted','interested','quote_sent','booked','not_now','closed'))
);

create table if not exists public.hgn_sales_contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.hgn_customers(id) on delete cascade,
  lead_id uuid references public.hgn_sales_leads(id) on delete cascade,
  contact_type text not null default 'note',
  contacted_at timestamptz not null default now(),
  summary text not null,
  next_follow_up date,
  created_at timestamptz not null default now(),
  constraint hgn_sales_contact_owner_check check (customer_id is not null or lead_id is not null)
);

create index if not exists hgn_billing_customer_idx on public.hgn_billing_items(customer_id, created_at desc);
create index if not exists hgn_billing_status_idx on public.hgn_billing_items(invoice_status, payment_status, due_date);
create index if not exists hgn_payments_date_idx on public.hgn_payments(payment_date desc);
create index if not exists hgn_sales_follow_up_idx on public.hgn_sales_leads(next_follow_up, stage);

alter table public.hgn_customers enable row level security;
alter table public.hgn_billing_items enable row level security;
alter table public.hgn_payments enable row level security;
alter table public.hgn_sales_leads enable row level security;
alter table public.hgn_sales_contacts enable row level security;

-- Reuse HGN's existing newsroom authorization model.
do $$
declare t text;
begin
  foreach t in array array['hgn_customers','hgn_billing_items','hgn_payments','hgn_sales_leads','hgn_sales_contacts'] loop
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

comment on table public.hgn_billing_items is 'HGN advertising billing queue, separate from production tracking.';
comment on table public.hgn_sales_leads is 'Lightweight advertising sales lead and follow-up queue.';
