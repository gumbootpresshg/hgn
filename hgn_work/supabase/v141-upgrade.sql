-- HGN v141 - Brand polish and tagline rollout
-- Defensive migration; safe to rerun after partial attempts.

create extension if not exists pgcrypto;

create table if not exists public.brand_polish_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_group text default 'brand',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.brand_polish_checks add column if not exists check_title text;
alter table public.brand_polish_checks add column if not exists check_group text default 'brand';
alter table public.brand_polish_checks add column if not exists status text default 'review';
alter table public.brand_polish_checks add column if not exists priority text default 'medium';
alter table public.brand_polish_checks add column if not exists owner text default 'Admin / Editor';
alter table public.brand_polish_checks add column if not exists notes text;
alter table public.brand_polish_checks add column if not exists sort_order integer default 100;
alter table public.brand_polish_checks add column if not exists created_at timestamptz default now();
alter table public.brand_polish_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.brand_polish_placements (
  id uuid primary key default gen_random_uuid(),
  placement_title text not null,
  placement_area text default 'public site',
  expected_text text default 'Free, Independent, Local.',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.brand_polish_placements add column if not exists placement_title text;
alter table public.brand_polish_placements add column if not exists placement_area text default 'public site';
alter table public.brand_polish_placements add column if not exists expected_text text default 'Free, Independent, Local.';
alter table public.brand_polish_placements add column if not exists status text default 'review';
alter table public.brand_polish_placements add column if not exists priority text default 'medium';
alter table public.brand_polish_placements add column if not exists owner text default 'Admin / Editor';
alter table public.brand_polish_placements add column if not exists sort_order integer default 100;
alter table public.brand_polish_placements add column if not exists created_at timestamptz default now();
alter table public.brand_polish_placements add column if not exists updated_at timestamptz default now();

create table if not exists public.brand_polish_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  status text default 'open',
  owner text default 'Admin / Editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.brand_polish_notes add column if not exists note_title text;
alter table public.brand_polish_notes add column if not exists note_body text;
alter table public.brand_polish_notes add column if not exists status text default 'open';
alter table public.brand_polish_notes add column if not exists owner text default 'Admin / Editor';
alter table public.brand_polish_notes add column if not exists created_at timestamptz default now();
alter table public.brand_polish_notes add column if not exists updated_at timestamptz default now();

create index if not exists idx_brand_polish_checks_status on public.brand_polish_checks(status);
create index if not exists idx_brand_polish_checks_sort on public.brand_polish_checks(sort_order);
create index if not exists idx_brand_polish_placements_status on public.brand_polish_placements(status);
create index if not exists idx_brand_polish_placements_sort on public.brand_polish_placements(sort_order);

insert into public.brand_polish_checks (check_title, check_group, status, priority, owner, notes, sort_order)
select * from (values
  ('Header tagline updated', 'identity', 'done', 'critical', 'Admin', 'The masthead tagline now reads: Free, Independent, Local.', 10),
  ('Avoid repeated place name under masthead', 'identity', 'done', 'high', 'Admin', 'The tagline no longer repeats Haida Gwaii directly under the site name.', 20),
  ('Homepage first impression checked', 'public polish', 'review', 'critical', 'Admin / Editor', 'Check that the new line feels strong on desktop and mobile.', 30),
  ('Footer and public pages checked', 'consistency', 'review', 'medium', 'Admin', 'Look for any old tagline copy that should be updated later.', 40)
) as seed(check_title, check_group, status, priority, owner, notes, sort_order)
where not exists (select 1 from public.brand_polish_checks where brand_polish_checks.check_title = seed.check_title);

insert into public.brand_polish_placements (placement_title, placement_area, expected_text, status, priority, owner, sort_order)
select * from (values
  ('Main masthead tagline', 'header', 'Free, Independent, Local.', 'done', 'critical', 'Admin', 10),
  ('Public brand status page', 'public route', 'Free, Independent, Local.', 'done', 'medium', 'Admin', 20),
  ('Soft-beta launch copy', 'launch materials', 'Free, Independent, Local.', 'review', 'medium', 'Admin / Editor', 30)
) as seed(placement_title, placement_area, expected_text, status, priority, owner, sort_order)
where not exists (select 1 from public.brand_polish_placements where brand_polish_placements.placement_title = seed.placement_title);

insert into public.brand_polish_notes (note_title, note_body, status, owner)
select 'v141 brand polish', 'Changed the masthead tagline to Free, Independent, Local. for a cleaner soft-beta identity.', 'open', 'Admin / Editor'
where not exists (select 1 from public.brand_polish_notes where note_title = 'v141 brand polish');
