-- HGN v85 - Rights Desk
-- Content rights, photo releases, licensing and takedown workflow for beta launch.

create extension if not exists pgcrypto;

create table if not exists public.content_rights_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  asset_type text not null default 'photo',
  source_name text,
  source_contact text,
  license_status text not null default 'unknown',
  usage_scope text,
  credit_line text,
  related_article_slug text,
  file_url text,
  expires_at date,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_rights_assets add column if not exists title text;
alter table public.content_rights_assets add column if not exists asset_type text default 'photo';
alter table public.content_rights_assets add column if not exists source_name text;
alter table public.content_rights_assets add column if not exists source_contact text;
alter table public.content_rights_assets add column if not exists license_status text default 'unknown';
alter table public.content_rights_assets add column if not exists usage_scope text;
alter table public.content_rights_assets add column if not exists credit_line text;
alter table public.content_rights_assets add column if not exists related_article_slug text;
alter table public.content_rights_assets add column if not exists file_url text;
alter table public.content_rights_assets add column if not exists expires_at date;
alter table public.content_rights_assets add column if not exists resolved_at timestamptz;
alter table public.content_rights_assets add column if not exists notes text;
alter table public.content_rights_assets add column if not exists created_at timestamptz default now();
alter table public.content_rights_assets add column if not exists updated_at timestamptz default now();

create table if not exists public.content_release_forms (
  id uuid primary key default gen_random_uuid(),
  subject_name text not null,
  release_type text not null default 'photo-release',
  status text not null default 'needed',
  signer_contact text,
  asset_title text,
  related_article_slug text,
  signed_at timestamptz,
  expires_at date,
  storage_url text,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_release_forms add column if not exists subject_name text;
alter table public.content_release_forms add column if not exists release_type text default 'photo-release';
alter table public.content_release_forms add column if not exists status text default 'needed';
alter table public.content_release_forms add column if not exists signer_contact text;
alter table public.content_release_forms add column if not exists asset_title text;
alter table public.content_release_forms add column if not exists related_article_slug text;
alter table public.content_release_forms add column if not exists signed_at timestamptz;
alter table public.content_release_forms add column if not exists expires_at date;
alter table public.content_release_forms add column if not exists storage_url text;
alter table public.content_release_forms add column if not exists resolved_at timestamptz;
alter table public.content_release_forms add column if not exists notes text;
alter table public.content_release_forms add column if not exists created_at timestamptz default now();
alter table public.content_release_forms add column if not exists updated_at timestamptz default now();

create table if not exists public.takedown_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text,
  requester_contact text,
  request_type text not null default 'rights',
  status text not null default 'new',
  priority text not null default 'normal',
  content_url text,
  related_article_slug text,
  claim_summary text not null,
  response_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.takedown_requests add column if not exists requester_name text;
alter table public.takedown_requests add column if not exists requester_contact text;
alter table public.takedown_requests add column if not exists request_type text default 'rights';
alter table public.takedown_requests add column if not exists status text default 'new';
alter table public.takedown_requests add column if not exists priority text default 'normal';
alter table public.takedown_requests add column if not exists content_url text;
alter table public.takedown_requests add column if not exists related_article_slug text;
alter table public.takedown_requests add column if not exists claim_summary text;
alter table public.takedown_requests add column if not exists response_notes text;
alter table public.takedown_requests add column if not exists resolved_at timestamptz;
alter table public.takedown_requests add column if not exists created_at timestamptz default now();
alter table public.takedown_requests add column if not exists updated_at timestamptz default now();

create table if not exists public.rights_review_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rights_area text not null default 'media',
  status text not null default 'todo',
  priority text not null default 'normal',
  owner text,
  due_date date,
  related_article_slug text,
  notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rights_review_tasks add column if not exists title text;
alter table public.rights_review_tasks add column if not exists rights_area text default 'media';
alter table public.rights_review_tasks add column if not exists status text default 'todo';
alter table public.rights_review_tasks add column if not exists priority text default 'normal';
alter table public.rights_review_tasks add column if not exists owner text;
alter table public.rights_review_tasks add column if not exists due_date date;
alter table public.rights_review_tasks add column if not exists related_article_slug text;
alter table public.rights_review_tasks add column if not exists notes text;
alter table public.rights_review_tasks add column if not exists resolved_at timestamptz;
alter table public.rights_review_tasks add column if not exists created_at timestamptz default now();
alter table public.rights_review_tasks add column if not exists updated_at timestamptz default now();

create index if not exists idx_content_rights_assets_status on public.content_rights_assets (license_status);
create index if not exists idx_content_rights_assets_article on public.content_rights_assets (related_article_slug);
create index if not exists idx_content_release_forms_status on public.content_release_forms (status);
create index if not exists idx_takedown_requests_status_priority on public.takedown_requests (status, priority);
create index if not exists idx_rights_review_tasks_status_priority on public.rights_review_tasks (status, priority);

insert into public.rights_review_tasks (title, rights_area, status, priority, notes)
select 'Audit beta homepage and top stories for image credits', 'media', 'todo', 'high', 'Confirm every featured image has source, credit, and usage rights before public beta.'
where not exists (select 1 from public.rights_review_tasks where title = 'Audit beta homepage and top stories for image credits');

insert into public.rights_review_tasks (title, rights_area, status, priority, notes)
select 'Prepare standard photo release workflow', 'release forms', 'todo', 'normal', 'Create a repeatable workflow for minors, community events, supplied photos and contributor uploads.'
where not exists (select 1 from public.rights_review_tasks where title = 'Prepare standard photo release workflow');

insert into public.content_rights_assets (title, asset_type, license_status, usage_scope, credit_line, notes)
select 'Beta placeholder image audit', 'photo', 'needs-review', 'website and social', 'HGN / supplied', 'Replace placeholder with real asset records as stories are prepared.'
where not exists (select 1 from public.content_rights_assets where title = 'Beta placeholder image audit');
