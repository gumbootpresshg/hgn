-- HGN v107 - Story Polish
-- Lightweight final story-quality workflow for a two-person admin/editor beta.

create table if not exists public.story_polish_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  story_area text not null default 'copy',
  item_status text not null default 'needs polish',
  priority text not null default 'normal',
  owner text not null default 'Admin / Editor',
  article_slug text,
  notes text,
  sort_order integer not null default 100,
  is_done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_polish_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'copy',
  helper text,
  is_ready boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.story_polish_items add column if not exists title text;
alter table public.story_polish_items add column if not exists story_area text not null default 'copy';
alter table public.story_polish_items add column if not exists item_status text not null default 'needs polish';
alter table public.story_polish_items add column if not exists priority text not null default 'normal';
alter table public.story_polish_items add column if not exists owner text not null default 'Admin / Editor';
alter table public.story_polish_items add column if not exists article_slug text;
alter table public.story_polish_items add column if not exists notes text;
alter table public.story_polish_items add column if not exists sort_order integer not null default 100;
alter table public.story_polish_items add column if not exists is_done boolean not null default false;
alter table public.story_polish_items add column if not exists completed_at timestamptz;
alter table public.story_polish_items add column if not exists created_at timestamptz not null default now();
alter table public.story_polish_items add column if not exists updated_at timestamptz not null default now();

alter table public.story_polish_checks add column if not exists title text;
alter table public.story_polish_checks add column if not exists check_area text not null default 'copy';
alter table public.story_polish_checks add column if not exists helper text;
alter table public.story_polish_checks add column if not exists is_ready boolean not null default false;
alter table public.story_polish_checks add column if not exists sort_order integer not null default 100;
alter table public.story_polish_checks add column if not exists created_at timestamptz not null default now();
alter table public.story_polish_checks add column if not exists updated_at timestamptz not null default now();

create index if not exists story_polish_items_status_idx on public.story_polish_items (item_status);
create index if not exists story_polish_items_priority_idx on public.story_polish_items (priority);
create index if not exists story_polish_items_sort_idx on public.story_polish_items (sort_order);
create index if not exists story_polish_checks_sort_idx on public.story_polish_checks (sort_order);

insert into public.story_polish_checks (title, check_area, helper, is_ready, sort_order)
select 'Headline has a final read', 'headline', 'Check clarity, location, tone and whether the headline works on mobile.', false, 10
where not exists (select 1 from public.story_polish_checks where title = 'Headline has a final read');

insert into public.story_polish_checks (title, check_area, helper, is_ready, sort_order)
select 'Image details are complete', 'image', 'Confirm credit, caption, alt text and homepage/mobile crop.', false, 20
where not exists (select 1 from public.story_polish_checks where title = 'Image details are complete');

insert into public.story_polish_checks (title, check_area, helper, is_ready, sort_order)
select 'SEO basics are filled', 'seo', 'Confirm slug, excerpt, search title and social share copy.', false, 30
where not exists (select 1 from public.story_polish_checks where title = 'SEO basics are filled');

insert into public.story_polish_items (title, story_area, item_status, priority, owner, notes, sort_order)
select 'Run final polish on today lead story', 'copy', 'needs polish', 'high', 'Admin / Editor', 'Use this as the last quality pass before the story moves to fast publish or homepage control.', 10
where not exists (select 1 from public.story_polish_items where title = 'Run final polish on today lead story');
