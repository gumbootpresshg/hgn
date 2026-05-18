-- HGN v80 - Membership Desk
-- Adds beta membership planning, supporter benefits, launch tasks, and a public membership beta page.

create extension if not exists pgcrypto;

create table if not exists public.member_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  status text not null default 'draft',
  price_cad numeric(10,2),
  billing_period text not null default 'monthly',
  audience text default 'reader',
  summary text,
  benefits text,
  is_public boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_plans add column if not exists title text;
alter table public.member_plans add column if not exists slug text;
alter table public.member_plans add column if not exists status text not null default 'draft';
alter table public.member_plans add column if not exists price_cad numeric(10,2);
alter table public.member_plans add column if not exists billing_period text not null default 'monthly';
alter table public.member_plans add column if not exists audience text default 'reader';
alter table public.member_plans add column if not exists summary text;
alter table public.member_plans add column if not exists benefits text;
alter table public.member_plans add column if not exists is_public boolean not null default false;
alter table public.member_plans add column if not exists sort_order integer not null default 100;
alter table public.member_plans add column if not exists created_at timestamptz not null default now();
alter table public.member_plans add column if not exists updated_at timestamptz not null default now();

create table if not exists public.member_prospects (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  source text default 'manual',
  status text not null default 'interested',
  priority text not null default 'normal',
  plan_interest text,
  community text,
  notes text,
  next_step text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_prospects add column if not exists full_name text;
alter table public.member_prospects add column if not exists email text;
alter table public.member_prospects add column if not exists phone text;
alter table public.member_prospects add column if not exists source text default 'manual';
alter table public.member_prospects add column if not exists status text not null default 'interested';
alter table public.member_prospects add column if not exists priority text not null default 'normal';
alter table public.member_prospects add column if not exists plan_interest text;
alter table public.member_prospects add column if not exists community text;
alter table public.member_prospects add column if not exists notes text;
alter table public.member_prospects add column if not exists next_step text;
alter table public.member_prospects add column if not exists last_contacted_at timestamptz;
alter table public.member_prospects add column if not exists created_at timestamptz not null default now();
alter table public.member_prospects add column if not exists updated_at timestamptz not null default now();

create table if not exists public.member_benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'planned',
  benefit_type text not null default 'access',
  owner text,
  description text,
  launch_required boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_benefits add column if not exists title text;
alter table public.member_benefits add column if not exists status text not null default 'planned';
alter table public.member_benefits add column if not exists benefit_type text not null default 'access';
alter table public.member_benefits add column if not exists owner text;
alter table public.member_benefits add column if not exists description text;
alter table public.member_benefits add column if not exists launch_required boolean not null default false;
alter table public.member_benefits add column if not exists sort_order integer not null default 100;
alter table public.member_benefits add column if not exists created_at timestamptz not null default now();
alter table public.member_benefits add column if not exists updated_at timestamptz not null default now();

create table if not exists public.membership_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'launch',
  status text not null default 'todo',
  priority text not null default 'normal',
  owner text,
  due_at timestamptz,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.membership_tasks add column if not exists title text;
alter table public.membership_tasks add column if not exists area text not null default 'launch';
alter table public.membership_tasks add column if not exists status text not null default 'todo';
alter table public.membership_tasks add column if not exists priority text not null default 'normal';
alter table public.membership_tasks add column if not exists owner text;
alter table public.membership_tasks add column if not exists due_at timestamptz;
alter table public.membership_tasks add column if not exists notes text;
alter table public.membership_tasks add column if not exists completed_at timestamptz;
alter table public.membership_tasks add column if not exists created_at timestamptz not null default now();
alter table public.membership_tasks add column if not exists updated_at timestamptz not null default now();

create index if not exists member_plans_status_idx on public.member_plans(status);
create index if not exists member_plans_public_idx on public.member_plans(is_public, sort_order);
create index if not exists member_prospects_status_idx on public.member_prospects(status);
create index if not exists member_prospects_priority_idx on public.member_prospects(priority);
create index if not exists member_benefits_status_idx on public.member_benefits(status);
create index if not exists membership_tasks_status_idx on public.membership_tasks(status);

insert into public.member_plans (title, slug, status, price_cad, billing_period, audience, summary, benefits, is_public, sort_order)
select 'Founding Supporter', 'founding-supporter', 'review', 8.00, 'monthly', 'reader', 'Low-friction founding membership for readers who want HGN to be sustainable.', 'Name on supporter wall, member updates, early community survey access.', true, 10
where not exists (select 1 from public.member_plans where slug = 'founding-supporter');

insert into public.member_plans (title, slug, status, price_cad, billing_period, audience, summary, benefits, is_public, sort_order)
select 'Community Builder', 'community-builder', 'draft', 20.00, 'monthly', 'local champion', 'Higher support level for readers, families and organizations that want to help fund local coverage.', 'Everything in Founding Supporter plus launch acknowledgements and beta briefings.', true, 20
where not exists (select 1 from public.member_plans where slug = 'community-builder');

insert into public.member_benefits (title, status, benefit_type, owner, description, launch_required, sort_order)
select 'Supporter thank-you wall', 'planned', 'recognition', 'Publisher', 'Simple public/private acknowledgement option for founding supporters.', true, 10
where not exists (select 1 from public.member_benefits where title = 'Supporter thank-you wall');

insert into public.member_benefits (title, status, benefit_type, owner, description, launch_required, sort_order)
select 'Monthly member update', 'ready', 'communication', 'Editor', 'Short update on what HGN published, what changed, and what support made possible.', true, 20
where not exists (select 1 from public.member_benefits where title = 'Monthly member update');

insert into public.membership_tasks (title, area, status, priority, owner, notes)
select 'Confirm beta membership payment path', 'payments', 'todo', 'urgent', 'Publisher', 'Decide whether beta uses Stripe, manual invoices, Square links, or waitlist-only intake.'
where not exists (select 1 from public.membership_tasks where title = 'Confirm beta membership payment path');

insert into public.membership_tasks (title, area, status, priority, owner, notes)
select 'Write founding supporter launch copy', 'copy', 'todo', 'high', 'Editor', 'Keep it community-first and clear that HGN is still in beta.'
where not exists (select 1 from public.membership_tasks where title = 'Write founding supporter launch copy');
