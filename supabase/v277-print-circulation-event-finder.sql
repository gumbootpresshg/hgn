-- HGN v0.57.0 Print circulation and AI event finder
create extension if not exists pgcrypto;

create table if not exists public.hgn_print_subscribers (
  id uuid primary key default gen_random_uuid(),
  mailing_name text not null,
  contact_name text,
  address_line_1 text not null,
  address_line_2 text,
  community text,
  province text default 'BC',
  postal_code text,
  country text default 'Canada',
  email text,
  phone text,
  copies integer not null default 1 check (copies > 0),
  delivery_method text not null default 'mail',
  rate_type text not null default 'island',
  status text not null default 'active',
  start_date date,
  expiry_date date,
  paid_through date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hgn_print_distribution_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  community text,
  contact_name text,
  phone text,
  email text,
  route_name text,
  regular_copies integer not null default 0,
  summer_copies integer,
  winter_copies integer,
  distribution_type text not null default 'free',
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hgn_print_issues (
  id uuid primary key default gen_random_uuid(),
  publication_date date not null,
  issue_name text,
  issue_number text,
  copies_printed integer not null default 0,
  subscriber_copies integer not null default 0,
  office_copies integer not null default 0,
  complimentary_copies integer not null default 0,
  damaged_unused integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(publication_date, issue_number)
);

create table if not exists public.hgn_print_distribution_runs (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.hgn_print_issues(id) on delete cascade,
  location_id uuid not null references public.hgn_print_distribution_locations(id) on delete cascade,
  delivered integer not null default 0,
  returned integer not null default 0,
  notes text,
  entered_at timestamptz not null default now(),
  entered_by uuid,
  unique(issue_id, location_id),
  check (returned >= 0 and delivered >= 0 and returned <= delivered)
);

create table if not exists public.hgn_print_label_runs (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.hgn_print_issues(id) on delete set null,
  label_format text not null default 'avery-5160',
  subscriber_count integer not null default 0,
  copy_count integer not null default 0,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.hgn_event_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  source_type text not null default 'community',
  community text,
  active boolean not null default true,
  last_checked_at timestamptz,
  last_status text not null default 'never_checked',
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hgn_print_subscribers_status_expiry_idx on public.hgn_print_subscribers(status, expiry_date);
create index if not exists hgn_print_runs_issue_idx on public.hgn_print_distribution_runs(issue_id);
create index if not exists hgn_print_runs_location_idx on public.hgn_print_distribution_runs(location_id);
create index if not exists hgn_print_issues_date_idx on public.hgn_print_issues(publication_date desc);

alter table public.hgn_print_subscribers enable row level security;
alter table public.hgn_print_distribution_locations enable row level security;
alter table public.hgn_print_issues enable row level security;
alter table public.hgn_print_distribution_runs enable row level security;
alter table public.hgn_print_label_runs enable row level security;
alter table public.hgn_event_sources enable row level security;

-- Existing publisher helper is used throughout HGN. Fall back to authenticated staff profiles where needed.
do $$ begin
  create policy "publisher manage print subscribers" on public.hgn_print_subscribers for all to authenticated using (public.hgn_is_editor()) with check (public.hgn_is_editor());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "publisher manage print locations" on public.hgn_print_distribution_locations for all to authenticated using (public.hgn_is_editor()) with check (public.hgn_is_editor());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "publisher manage print issues" on public.hgn_print_issues for all to authenticated using (public.hgn_is_editor()) with check (public.hgn_is_editor());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "publisher manage print runs" on public.hgn_print_distribution_runs for all to authenticated using (public.hgn_is_editor()) with check (public.hgn_is_editor());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "publisher manage label runs" on public.hgn_print_label_runs for all to authenticated using (public.hgn_is_editor()) with check (public.hgn_is_editor());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "publisher manage event sources" on public.hgn_event_sources for all to authenticated using (public.hgn_is_editor()) with check (public.hgn_is_editor());
exception when duplicate_object then null; end $$;
