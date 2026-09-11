-- HGN v105 Cleanup Desk
-- Lightweight admin/editor cleanup queue for beta loose ends.

create table if not exists cleanup_desk_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cleanup_area text not null default 'publishing',
  cleanup_status text not null default 'open',
  priority text not null default 'normal',
  owner text not null default 'Admin / Editor',
  notes text,
  is_done boolean not null default false,
  sort_order integer not null default 100,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cleanup_desk_sweeps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sweep_area text not null default 'admin',
  description text,
  is_complete boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cleanup_desk_items add column if not exists title text;
alter table cleanup_desk_items add column if not exists cleanup_area text not null default 'publishing';
alter table cleanup_desk_items add column if not exists cleanup_status text not null default 'open';
alter table cleanup_desk_items add column if not exists priority text not null default 'normal';
alter table cleanup_desk_items add column if not exists owner text not null default 'Admin / Editor';
alter table cleanup_desk_items add column if not exists notes text;
alter table cleanup_desk_items add column if not exists is_done boolean not null default false;
alter table cleanup_desk_items add column if not exists sort_order integer not null default 100;
alter table cleanup_desk_items add column if not exists completed_at timestamptz;
alter table cleanup_desk_items add column if not exists created_at timestamptz not null default now();
alter table cleanup_desk_items add column if not exists updated_at timestamptz not null default now();

alter table cleanup_desk_sweeps add column if not exists title text;
alter table cleanup_desk_sweeps add column if not exists sweep_area text not null default 'admin';
alter table cleanup_desk_sweeps add column if not exists description text;
alter table cleanup_desk_sweeps add column if not exists is_complete boolean not null default false;
alter table cleanup_desk_sweeps add column if not exists sort_order integer not null default 100;
alter table cleanup_desk_sweeps add column if not exists created_at timestamptz not null default now();
alter table cleanup_desk_sweeps add column if not exists updated_at timestamptz not null default now();

create index if not exists cleanup_desk_items_status_idx on cleanup_desk_items (cleanup_status);
create index if not exists cleanup_desk_items_area_idx on cleanup_desk_items (cleanup_area);
create index if not exists cleanup_desk_items_sort_idx on cleanup_desk_items (sort_order);
create index if not exists cleanup_desk_sweeps_sort_idx on cleanup_desk_sweeps (sort_order);

insert into cleanup_desk_items (title, cleanup_area, cleanup_status, priority, owner, notes, sort_order)
select * from (values
  ('Remove duplicate admin distractions', 'admin', 'open', 'high', 'Admin / Editor', 'Keep the daily workflow focused on the few pages that matter most during the two-person beta.', 10),
  ('Check homepage for stale lead stories', 'homepage', 'open', 'high', 'Admin / Editor', 'Before publishing, confirm the hero and priority slots still match the day.', 20),
  ('Sweep image captions and alt text', 'media', 'needs review', 'normal', 'Admin / Editor', 'Use this as a lightweight reminder before sharing or indexing stories.', 30)
) as seed(title, cleanup_area, cleanup_status, priority, owner, notes, sort_order)
where not exists (select 1 from cleanup_desk_items where cleanup_desk_items.title = seed.title);

insert into cleanup_desk_sweeps (title, sweep_area, description, is_complete, sort_order)
select * from (values
  ('Daily publish path is clear', 'publishing', 'Article, image, SEO, homepage and social basics have a simple owner.', false, 10),
  ('Admin pages are not overwhelming today', 'admin', 'Use Core, Today Board, Shift Center and Cleanup Desk as the main beta operating path.', false, 20),
  ('Public pages look safe on mobile', 'mobile', 'Spot check the homepage, article page and any new public status page.', false, 30)
) as seed(title, sweep_area, description, is_complete, sort_order)
where not exists (select 1 from cleanup_desk_sweeps where cleanup_desk_sweeps.title = seed.title);
