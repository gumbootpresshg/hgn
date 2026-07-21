-- HGN v114 - Ship Check
-- Lightweight pre-ship gate for the two-person admin/editor beta workflow.

create table if not exists public.ship_check_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'publishing',
  check_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  priority integer not null default 3,
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ship_check_runs (
  id uuid primary key default gen_random_uuid(),
  run_label text not null,
  run_status text not null default 'open',
  readiness_score integer not null default 70,
  summary text,
  next_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ship_check_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'site',
  is_ready boolean not null default false,
  helper text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ship_check_items_status_idx on public.ship_check_items(check_status);
create index if not exists ship_check_items_area_idx on public.ship_check_items(check_area);
create index if not exists ship_check_items_sort_idx on public.ship_check_items(sort_order);
create index if not exists ship_check_runs_status_idx on public.ship_check_runs(run_status);
create index if not exists ship_check_checks_sort_idx on public.ship_check_checks(sort_order);

insert into public.ship_check_items (title, check_area, check_status, owner, priority, notes, sort_order)
select 'Confirm the homepage lead story is intentional', 'homepage', 'open', 'Admin / Editor', 1, 'Make sure the hero story, image and headline still match what you want people to see first.', 10
where not exists (select 1 from public.ship_check_items where title = 'Confirm the homepage lead story is intentional');

insert into public.ship_check_items (title, check_area, check_status, owner, priority, notes, sort_order)
select 'Check latest story image credit, caption and alt text', 'media', 'open', 'Admin / Editor', 2, 'One quick media pass before publishing or sharing.', 20
where not exists (select 1 from public.ship_check_items where title = 'Check latest story image credit, caption and alt text');

insert into public.ship_check_items (title, check_area, check_status, owner, priority, notes, sort_order)
select 'Open the public site on mobile before calling it done', 'mobile', 'open', 'Admin / Editor', 2, 'This is a small beta, so one real phone check is worth more than a giant QA process.', 30
where not exists (select 1 from public.ship_check_items where title = 'Open the public site on mobile before calling it done');

insert into public.ship_check_runs (run_label, run_status, readiness_score, summary, next_step)
select 'Daily ship check', 'open', 72, 'Small pre-ship gate for the admin/editor beta workflow.', 'Clear the top open item, then publish or hold intentionally.'
where not exists (select 1 from public.ship_check_runs where run_label = 'Daily ship check');

insert into public.ship_check_checks (title, check_area, is_ready, helper, sort_order)
select 'Homepage has a clear lead', 'homepage', false, 'The first story should feel deliberate, not accidental.', 10
where not exists (select 1 from public.ship_check_checks where title = 'Homepage has a clear lead');

insert into public.ship_check_checks (title, check_area, is_ready, helper, sort_order)
select 'Published stories have basic SEO', 'seo', false, 'Slug, title, description and social image should be present for key stories.', 20
where not exists (select 1 from public.ship_check_checks where title = 'Published stories have basic SEO');

insert into public.ship_check_checks (title, check_area, is_ready, helper, sort_order)
select 'Mobile pass completed', 'mobile', false, 'Open the site on a phone and check homepage, article and menu.', 30
where not exists (select 1 from public.ship_check_checks where title = 'Mobile pass completed');
