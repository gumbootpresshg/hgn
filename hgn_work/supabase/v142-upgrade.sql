
-- HGN v142 - Reader Ready Polish
-- Defensive migration. Safe to rerun after partial attempts.

create table if not exists public.reader_ready_checks (
  id bigserial primary key,
  check_title text not null,
  check_area text default 'public polish',
  status text default 'review',
  priority text default 'medium',
  owner text default 'Admin / Editor',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.reader_ready_checks add column if not exists check_title text;
alter table public.reader_ready_checks add column if not exists check_area text default 'public polish';
alter table public.reader_ready_checks add column if not exists status text default 'review';
alter table public.reader_ready_checks add column if not exists priority text default 'medium';
alter table public.reader_ready_checks add column if not exists owner text default 'Admin / Editor';
alter table public.reader_ready_checks add column if not exists notes text;
alter table public.reader_ready_checks add column if not exists sort_order integer default 100;
alter table public.reader_ready_checks add column if not exists created_at timestamptz default now();
alter table public.reader_ready_checks add column if not exists updated_at timestamptz default now();

create table if not exists public.reader_ready_routes (
  id bigserial primary key,
  route_path text not null,
  route_label text not null,
  status text default 'review',
  priority text default 'medium',
  notes text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.reader_ready_routes add column if not exists route_path text;
alter table public.reader_ready_routes add column if not exists route_label text;
alter table public.reader_ready_routes add column if not exists status text default 'review';
alter table public.reader_ready_routes add column if not exists priority text default 'medium';
alter table public.reader_ready_routes add column if not exists notes text;
alter table public.reader_ready_routes add column if not exists sort_order integer default 100;
alter table public.reader_ready_routes add column if not exists created_at timestamptz default now();
alter table public.reader_ready_routes add column if not exists updated_at timestamptz default now();

create index if not exists idx_reader_ready_checks_status on public.reader_ready_checks(status);
create index if not exists idx_reader_ready_routes_status on public.reader_ready_routes(status);

insert into public.reader_ready_checks (check_title, check_area, status, priority, owner, notes, sort_order)
select 'Homepage feels launch-ready', 'homepage', 'review', 'critical', 'Admin / Editor', 'Review the first screen, lead story, visual rhythm, tagline, and local usefulness before sharing the beta link.', 10
where not exists (select 1 from public.reader_ready_checks where check_title = 'Homepage feels launch-ready');

insert into public.reader_ready_checks (check_title, check_area, status, priority, owner, notes, sort_order)
select 'Article page trust pass', 'articles', 'review', 'high', 'Editor', 'Check headline hierarchy, byline/date, image credit, alt text, corrections link, and mobile readability.', 20
where not exists (select 1 from public.reader_ready_checks where check_title = 'Article page trust pass');

insert into public.reader_ready_checks (check_title, check_area, status, priority, owner, notes, sort_order)
select 'Unfinished public surfaces hidden', 'cleanup', 'review', 'critical', 'Admin', 'Park or hide routes that are not ready for readers during the two-person soft beta.', 30
where not exists (select 1 from public.reader_ready_checks where check_title = 'Unfinished public surfaces hidden');

insert into public.reader_ready_checks (check_title, check_area, status, priority, owner, notes, sort_order)
select 'Mobile first impression checked', 'mobile', 'review', 'critical', 'Admin / Editor', 'Open the homepage and one article on a phone and check spacing, nav, image crops, and readability.', 40
where not exists (select 1 from public.reader_ready_checks where check_title = 'Mobile first impression checked');

insert into public.reader_ready_routes (route_path, route_label, status, priority, notes, sort_order)
select '/', 'Homepage', 'review', 'critical', 'The first route readers will judge. Confirm the lead story, tagline, local utility, and mobile layout.', 10
where not exists (select 1 from public.reader_ready_routes where route_path = '/');

insert into public.reader_ready_routes (route_path, route_label, status, priority, notes, sort_order)
select '/articles', 'Article index', 'review', 'high', 'Confirm story cards look consistent and empty states do not feel unfinished.', 20
where not exists (select 1 from public.reader_ready_routes where route_path = '/articles');

insert into public.reader_ready_routes (route_path, route_label, status, priority, notes, sort_order)
select '/about', 'About page', 'review', 'medium', 'Make sure the beta identity and free independent local positioning feel clear.', 30
where not exists (select 1 from public.reader_ready_routes where route_path = '/about');

insert into public.reader_ready_routes (route_path, route_label, status, priority, notes, sort_order)
select '/contact', 'Contact page', 'review', 'medium', 'Confirm readers can contact the newsroom or submit corrections/tips without confusion.', 40
where not exists (select 1 from public.reader_ready_routes where route_path = '/contact');
