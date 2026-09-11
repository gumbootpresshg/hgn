-- HGN v119 - Admin Map Consolidation
-- Keeps the two-person admin/editor beta workflow simple by classifying admin tools as primary, occasional, or parked.

create table if not exists public.admin_map_tools (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  href text not null,
  tool_group text not null default 'workflow',
  tool_status text not null default 'occasional',
  use_when text,
  keep_reason text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_map_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_map_tools_status_idx on public.admin_map_tools(tool_status);
create index if not exists admin_map_tools_group_idx on public.admin_map_tools(tool_group);
create index if not exists admin_map_tools_sort_idx on public.admin_map_tools(sort_order);
create index if not exists admin_map_notes_status_idx on public.admin_map_notes(note_status);

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Newsroom Hub', '/admin/newsroom-hub', 'core', 'primary', 'Start here before opening any other admin screen.', 'This is the main consolidated daily workflow.', 10
where not exists (select 1 from public.admin_map_tools where title = 'Newsroom Hub');

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Core Dashboard', '/admin/core', 'core', 'primary', 'Use when you need the bigger beta-ready overview.', 'Keeps daily readiness, publishing and homepage status together.', 20
where not exists (select 1 from public.admin_map_tools where title = 'Core Dashboard');

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Frontpage Radar', '/admin/frontpage-radar', 'homepage', 'primary', 'Use when the homepage feels stale, duplicated, or unbalanced.', 'Homepage freshness is one of the biggest beta-readiness signals.', 30
where not exists (select 1 from public.admin_map_tools where title = 'Frontpage Radar');

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Publish Sweep', '/admin/publish-sweep', 'publishing', 'primary', 'Use before important stories go live.', 'Catches headline, image, alt text, slug, SEO and homepage gaps.', 40
where not exists (select 1 from public.admin_map_tools where title = 'Publish Sweep');

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Fast Publish', '/admin/fast-publish', 'publishing', 'occasional', 'Use for quick local updates that should not become a full workflow.', 'Useful, but should not replace normal publish quality checks.', 50
where not exists (select 1 from public.admin_map_tools where title = 'Fast Publish');

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Media Flow', '/admin/media-flow', 'media', 'occasional', 'Use when photos, captions, credits or mobile crops need cleanup.', 'Keeps article presentation and Google News quality stronger.', 60
where not exists (select 1 from public.admin_map_tools where title = 'Media Flow');

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Live Desk', '/admin/live-desk', 'live', 'occasional', 'Use only for real rolling updates or urgent local information.', 'Important, but should stay out of the daily flow unless needed.', 70
where not exists (select 1 from public.admin_map_tools where title = 'Live Desk');

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Handoff', '/admin/handoff', 'handoff', 'occasional', 'Use when one person needs to leave the other a clear next step.', 'Simple two-person coordination without meetings or long notes.', 80
where not exists (select 1 from public.admin_map_tools where title = 'Handoff');

insert into public.admin_map_tools (title, href, tool_group, tool_status, use_when, keep_reason, sort_order)
select 'Trim Desk', '/admin/trim-desk', 'cleanup', 'parked', 'Use only when deciding what admin screens feel noisy or unnecessary.', 'Helpful for cleanup, but not part of the normal publishing day.', 90
where not exists (select 1 from public.admin_map_tools where title = 'Trim Desk');

insert into public.admin_map_notes (note_title, note_body, note_status, owner)
select 'Admin map rule', 'For the two-person beta, default to Newsroom Hub, Frontpage Radar and Publish Sweep. Everything else is occasional unless it solves today''s problem.', 'open', 'Admin / Editor'
where not exists (select 1 from public.admin_map_notes where note_title = 'Admin map rule');
