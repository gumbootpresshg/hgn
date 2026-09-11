-- HGN v30 organization + accounting/Square Phase 1 prep

-- Letters table safety
create table if not exists letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  name text,
  town text,
  email text,
  title text,
  letter text,
  body text,
  status text default 'new',
  created_at timestamptz default now()
);

alter table letters_to_editor add column if not exists title text;
alter table letters_to_editor add column if not exists town text;
alter table letters_to_editor add column if not exists status text default 'new';

-- Marketplace configurable categories/towns
create table if not exists marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists marketplace_towns (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into marketplace_categories (name, sort_order) values
  ('Vehicles', 1), ('Rentals', 2), ('Jobs', 3), ('Services', 4), ('Boats', 5), ('Equipment', 6), ('Furniture', 7), ('Free Stuff', 8), ('Lost & Found', 9), ('Local Crafts', 10)
on conflict (name) do nothing;

insert into marketplace_towns (name, sort_order) values
  ('Daajing Giids', 1), ('Skidegate', 2), ('Masset', 3), ('Old Massett', 4), ('Port Clements', 5), ('Tlell', 6), ('Sandspit', 7), ('Tow Hill', 8), ('Other', 99)
on conflict (name) do nothing;

-- Accounting / Square hosted checkout Phase 1
create table if not exists accounting_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  business_name text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists accounting_invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references accounting_customers(id) on delete set null,
  customer_name text not null,
  customer_email text,
  description text,
  amount_cents integer not null default 0,
  currency text default 'CAD',
  status text default 'draft',
  due_date date,
  square_checkout_url text,
  square_payment_id text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists accounting_invoices_status_idx on accounting_invoices(status);
create index if not exists accounting_invoices_created_idx on accounting_invoices(created_at desc);

-- Permissive policies for local build; tighten before public launch.
alter table accounting_invoices enable row level security;
drop policy if exists "Admins can manage accounting invoices" on accounting_invoices;
create policy "Admins can manage accounting invoices"
on accounting_invoices for all
using (true)
with check (true);
