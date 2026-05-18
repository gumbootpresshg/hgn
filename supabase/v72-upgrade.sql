-- HGN v72 - Revenue readiness + beta advertiser kit
-- Safe to run after v71. This migration is defensive and additive.

create extension if not exists pgcrypto;

create table if not exists public.ad_packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  placement text not null default 'homepage',
  status text not null default 'draft',
  price_cad numeric,
  billing_period text not null default 'monthly',
  summary text,
  details text,
  inventory_notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ad_packages add column if not exists placement text not null default 'homepage';
alter table public.ad_packages add column if not exists status text not null default 'draft';
alter table public.ad_packages add column if not exists price_cad numeric;
alter table public.ad_packages add column if not exists billing_period text not null default 'monthly';
alter table public.ad_packages add column if not exists summary text;
alter table public.ad_packages add column if not exists details text;
alter table public.ad_packages add column if not exists inventory_notes text;
alter table public.ad_packages add column if not exists sort_order integer not null default 100;
alter table public.ad_packages add column if not exists created_at timestamptz not null default now();
alter table public.ad_packages add column if not exists updated_at timestamptz not null default now();

create table if not exists public.advertiser_prospects (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  email text,
  phone text,
  category text not null default 'local-business',
  status text not null default 'lead',
  priority text not null default 'normal',
  notes text,
  next_step text,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.advertiser_prospects add column if not exists contact_name text;
alter table public.advertiser_prospects add column if not exists email text;
alter table public.advertiser_prospects add column if not exists phone text;
alter table public.advertiser_prospects add column if not exists category text not null default 'local-business';
alter table public.advertiser_prospects add column if not exists status text not null default 'lead';
alter table public.advertiser_prospects add column if not exists priority text not null default 'normal';
alter table public.advertiser_prospects add column if not exists notes text;
alter table public.advertiser_prospects add column if not exists next_step text;
alter table public.advertiser_prospects add column if not exists last_contact_at timestamptz;
alter table public.advertiser_prospects add column if not exists created_at timestamptz not null default now();
alter table public.advertiser_prospects add column if not exists updated_at timestamptz not null default now();

create table if not exists public.sponsor_assets (
  id uuid primary key default gen_random_uuid(),
  sponsor_name text not null,
  asset_type text not null default 'logo',
  status text not null default 'draft',
  file_url text,
  target_url text,
  alt_text text,
  placement text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sponsor_assets add column if not exists asset_type text not null default 'logo';
alter table public.sponsor_assets add column if not exists status text not null default 'draft';
alter table public.sponsor_assets add column if not exists file_url text;
alter table public.sponsor_assets add column if not exists target_url text;
alter table public.sponsor_assets add column if not exists alt_text text;
alter table public.sponsor_assets add column if not exists placement text;
alter table public.sponsor_assets add column if not exists notes text;
alter table public.sponsor_assets add column if not exists created_at timestamptz not null default now();
alter table public.sponsor_assets add column if not exists updated_at timestamptz not null default now();

create table if not exists public.revenue_readiness_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'sales',
  status text not null default 'todo',
  priority text not null default 'normal',
  owner text,
  due_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.revenue_readiness_tasks add column if not exists area text not null default 'sales';
alter table public.revenue_readiness_tasks add column if not exists status text not null default 'todo';
alter table public.revenue_readiness_tasks add column if not exists priority text not null default 'normal';
alter table public.revenue_readiness_tasks add column if not exists owner text;
alter table public.revenue_readiness_tasks add column if not exists due_at timestamptz;
alter table public.revenue_readiness_tasks add column if not exists notes text;
alter table public.revenue_readiness_tasks add column if not exists created_at timestamptz not null default now();
alter table public.revenue_readiness_tasks add column if not exists updated_at timestamptz not null default now();

create index if not exists ad_packages_status_idx on public.ad_packages(status);
create index if not exists ad_packages_sort_idx on public.ad_packages(sort_order);
create index if not exists advertiser_prospects_status_idx on public.advertiser_prospects(status);
create index if not exists advertiser_prospects_priority_idx on public.advertiser_prospects(priority);
create index if not exists sponsor_assets_status_idx on public.sponsor_assets(status);
create index if not exists revenue_readiness_tasks_status_idx on public.revenue_readiness_tasks(status);
create index if not exists revenue_readiness_tasks_priority_idx on public.revenue_readiness_tasks(priority);

insert into public.ad_packages (title, placement, status, price_cad, billing_period, summary, sort_order)
select 'Beta founding sponsor', 'sitewide', 'ready', 500, 'monthly', 'Early supporter placement across beta launch pages and selected community sections.', 10
where not exists (select 1 from public.ad_packages where lower(title) = 'beta founding sponsor');

insert into public.ad_packages (title, placement, status, price_cad, billing_period, summary, sort_order)
select 'Community board sponsor', 'community-board', 'review', 250, 'monthly', 'Sponsor visibility beside notices, events and community updates.', 20
where not exists (select 1 from public.ad_packages where lower(title) = 'community board sponsor');

insert into public.revenue_readiness_tasks (title, area, status, priority, notes)
select 'Confirm beta ad policy and sponsor acceptance rules', 'policy', 'todo', 'high', 'Define what ads/sponsors HGN accepts before public beta outreach.'
where not exists (select 1 from public.revenue_readiness_tasks where lower(title) = 'confirm beta ad policy and sponsor acceptance rules');

insert into public.revenue_readiness_tasks (title, area, status, priority, notes)
select 'Prepare first five local advertiser outreach targets', 'sales', 'todo', 'normal', 'Seed the prospect list with businesses most likely to support beta.'
where not exists (select 1 from public.revenue_readiness_tasks where lower(title) = 'prepare first five local advertiser outreach targets');
