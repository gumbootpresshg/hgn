-- HGN v118 - Newsroom Consolidation
-- Consolidates overlapping admin/editor beta workflow screens into one practical hub.

create table if not exists public.newsroom_hub_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default 'publishing',
  item_status text not null default 'next',
  priority text not null default 'today',
  owner text not null default 'Admin / Editor',
  source_screen text not null default 'Newsroom Hub',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsroom_hub_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  href text not null,
  link_group text not null default 'core',
  link_status text not null default 'visible',
  reason text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsroom_hub_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsroom_hub_items_status_idx on public.newsroom_hub_items(item_status);
create index if not exists newsroom_hub_items_area_idx on public.newsroom_hub_items(area);
create index if not exists newsroom_hub_items_priority_idx on public.newsroom_hub_items(priority);
create index if not exists newsroom_hub_items_sort_idx on public.newsroom_hub_items(sort_order);
create index if not exists newsroom_hub_links_group_idx on public.newsroom_hub_links(link_group);
create index if not exists newsroom_hub_links_sort_idx on public.newsroom_hub_links(sort_order);
create index if not exists newsroom_hub_notes_status_idx on public.newsroom_hub_notes(note_status);

insert into public.newsroom_hub_items (title, area, item_status, priority, owner, source_screen, notes, sort_order)
select 'Run the day from the hub first', 'publishing', 'next', 'today', 'Admin / Editor', 'Newsroom Hub', 'Open this before jumping between every admin desk. Pick the next useful move, then leave.', 10
where not exists (select 1 from public.newsroom_hub_items where title = 'Run the day from the hub first');

insert into public.newsroom_hub_items (title, area, item_status, priority, owner, source_screen, notes, sort_order)
select 'Confirm the frontpage still feels current', 'homepage', 'waiting', 'today', 'Admin / Editor', 'Frontpage Radar', 'Check hero freshness, duplicate stories and whether the homepage lead still makes sense.', 20
where not exists (select 1 from public.newsroom_hub_items where title = 'Confirm the frontpage still feels current');

insert into public.newsroom_hub_items (title, area, item_status, priority, owner, source_screen, notes, sort_order)
select 'Clear one publish blocker', 'publishing', 'ready', 'today', 'Admin / Editor', 'Publish Sweep', 'Image, headline, slug, caption, alt text or homepage placement should be the next small fix.', 30
where not exists (select 1 from public.newsroom_hub_items where title = 'Clear one publish blocker');

insert into public.newsroom_hub_links (title, href, link_group, link_status, reason, sort_order)
select 'Core dashboard', '/admin/core', 'core', 'primary', 'Best overall daily dashboard from the earlier beta-ready core work.', 10
where not exists (select 1 from public.newsroom_hub_links where title = 'Core dashboard');

insert into public.newsroom_hub_links (title, href, link_group, link_status, reason, sort_order)
select 'Newsroom hub', '/admin/newsroom-hub', 'core', 'primary', 'Start here during the consolidation phase.', 20
where not exists (select 1 from public.newsroom_hub_links where title = 'Newsroom hub');

insert into public.newsroom_hub_links (title, href, link_group, link_status, reason, sort_order)
select 'Frontpage radar', '/admin/frontpage-radar', 'homepage', 'keep', 'Useful when the homepage feels stale or unbalanced.', 30
where not exists (select 1 from public.newsroom_hub_links where title = 'Frontpage radar');

insert into public.newsroom_hub_links (title, href, link_group, link_status, reason, sort_order)
select 'Publish sweep', '/admin/publish-sweep', 'publishing', 'keep', 'Use for final story, media, SEO and homepage checks.', 40
where not exists (select 1 from public.newsroom_hub_links where title = 'Publish sweep');

insert into public.newsroom_hub_links (title, href, link_group, link_status, reason, sort_order)
select 'Live desk', '/admin/live-desk', 'live', 'keep', 'Only open when there is a real rolling update or urgent local item.', 50
where not exists (select 1 from public.newsroom_hub_links where title = 'Live desk');

insert into public.newsroom_hub_links (title, href, link_group, link_status, reason, sort_order)
select 'Handoff', '/admin/handoff', 'handoff', 'keep', 'Use when one person needs to leave a clean note for the other.', 60
where not exists (select 1 from public.newsroom_hub_links where title = 'Handoff');

insert into public.newsroom_hub_notes (note_title, note_body, note_status, owner)
select 'Consolidation rule', 'If a screen does not help the admin/editor workflow this week, treat it as optional and run the day from the hub.', 'open', 'Admin / Editor'
where not exists (select 1 from public.newsroom_hub_notes where note_title = 'Consolidation rule');
