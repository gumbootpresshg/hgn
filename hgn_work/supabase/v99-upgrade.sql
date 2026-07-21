-- HGN v99 upgrade: Publish Sweep
-- Lightweight final sweep for the two-person admin/editor beta workflow.

create table if not exists public.publish_sweeps (
  id uuid primary key default gen_random_uuid(),
  sweep_date date not null default current_date,
  title text not null,
  status text not null default 'open',
  lead_story text,
  homepage_focus text,
  notes text,
  created_by text default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publish_sweep_items (
  id uuid primary key default gen_random_uuid(),
  sweep_id uuid references public.publish_sweeps(id) on delete cascade,
  item_title text not null,
  item_type text not null default 'final_check',
  status text not null default 'open',
  owner text default 'Admin / Editor',
  is_blocking boolean not null default false,
  sort_order integer not null default 100,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists publish_sweeps_sweep_date_idx on public.publish_sweeps (sweep_date desc);
create index if not exists publish_sweeps_status_idx on public.publish_sweeps (status);
create index if not exists publish_sweep_items_sweep_id_idx on public.publish_sweep_items (sweep_id);
create index if not exists publish_sweep_items_status_idx on public.publish_sweep_items (status);
create index if not exists publish_sweep_items_blocking_idx on public.publish_sweep_items (is_blocking);

alter table public.publish_sweeps enable row level security;
alter table public.publish_sweep_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'publish_sweeps' and policyname = 'publish_sweeps_admin_all'
  ) then
    create policy publish_sweeps_admin_all on public.publish_sweeps for all using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'publish_sweep_items' and policyname = 'publish_sweep_items_admin_all'
  ) then
    create policy publish_sweep_items_admin_all on public.publish_sweep_items for all using (true) with check (true);
  end if;
end $$;

insert into public.publish_sweeps (title, status, lead_story, homepage_focus, notes)
select 'Today''s final publish sweep', 'open', 'Pick the story that most needs attention before it goes live.', 'Check hero, latest news and mobile layout.', 'Keep this small: only the checks that matter before publishing today.'
where not exists (select 1 from public.publish_sweeps where title = 'Today''s final publish sweep');

insert into public.publish_sweep_items (item_title, item_type, status, owner, is_blocking, sort_order, notes)
select 'Headline and deck read cleanly', 'copy', 'open', 'Editor', false, 10, 'Check spelling, local names and clarity.'
where not exists (select 1 from public.publish_sweep_items where item_title = 'Headline and deck read cleanly');

insert into public.publish_sweep_items (item_title, item_type, status, owner, is_blocking, sort_order, notes)
select 'Featured image has credit, caption and alt text', 'media', 'open', 'Admin / Editor', true, 20, 'Do not publish without image source details when a photo is used.'
where not exists (select 1 from public.publish_sweep_items where item_title = 'Featured image has credit, caption and alt text');

insert into public.publish_sweep_items (item_title, item_type, status, owner, is_blocking, sort_order, notes)
select 'Homepage placement is intentional', 'homepage', 'open', 'Admin', false, 30, 'Confirm hero, latest list and mobile order.'
where not exists (select 1 from public.publish_sweep_items where item_title = 'Homepage placement is intentional');

insert into public.publish_sweep_items (item_title, item_type, status, owner, is_blocking, sort_order, notes)
select 'SEO title, description and slug are ready', 'seo', 'open', 'Admin / Editor', false, 40, 'Useful for search, sharing and Google News prep.'
where not exists (select 1 from public.publish_sweep_items where item_title = 'SEO title, description and slug are ready');
