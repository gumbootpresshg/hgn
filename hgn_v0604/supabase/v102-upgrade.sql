-- HGN v102 - Quickshot Publisher
-- Fast admin/editor workflow for short local updates without adding public beta complexity.

create table if not exists public.quickshot_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  update_type text not null default 'local_update',
  status text not null default 'draft',
  priority text not null default 'normal',
  channel text not null default 'site',
  summary text,
  body text,
  photo_needed boolean not null default false,
  homepage_ready boolean not null default false,
  owner text not null default 'Admin / Editor',
  target_time text,
  published_at timestamptz,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quickshot_posts add column if not exists title text;
alter table public.quickshot_posts add column if not exists update_type text not null default 'local_update';
alter table public.quickshot_posts add column if not exists status text not null default 'draft';
alter table public.quickshot_posts add column if not exists priority text not null default 'normal';
alter table public.quickshot_posts add column if not exists channel text not null default 'site';
alter table public.quickshot_posts add column if not exists summary text;
alter table public.quickshot_posts add column if not exists body text;
alter table public.quickshot_posts add column if not exists photo_needed boolean not null default false;
alter table public.quickshot_posts add column if not exists homepage_ready boolean not null default false;
alter table public.quickshot_posts add column if not exists owner text not null default 'Admin / Editor';
alter table public.quickshot_posts add column if not exists target_time text;
alter table public.quickshot_posts add column if not exists published_at timestamptz;
alter table public.quickshot_posts add column if not exists sort_order integer not null default 100;
alter table public.quickshot_posts add column if not exists created_at timestamptz not null default now();
alter table public.quickshot_posts add column if not exists updated_at timestamptz not null default now();

create table if not exists public.quickshot_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  update_type text not null default 'local_update',
  prompt text,
  default_channel text not null default 'site',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quickshot_templates add column if not exists name text;
alter table public.quickshot_templates add column if not exists update_type text not null default 'local_update';
alter table public.quickshot_templates add column if not exists prompt text;
alter table public.quickshot_templates add column if not exists default_channel text not null default 'site';
alter table public.quickshot_templates add column if not exists sort_order integer not null default 100;
alter table public.quickshot_templates add column if not exists created_at timestamptz not null default now();
alter table public.quickshot_templates add column if not exists updated_at timestamptz not null default now();

create index if not exists quickshot_posts_status_idx on public.quickshot_posts(status);
create index if not exists quickshot_posts_update_type_idx on public.quickshot_posts(update_type);
create index if not exists quickshot_posts_priority_idx on public.quickshot_posts(priority);
create index if not exists quickshot_posts_sort_order_idx on public.quickshot_posts(sort_order);
create index if not exists quickshot_templates_sort_order_idx on public.quickshot_templates(sort_order);

insert into public.quickshot_templates (name, update_type, prompt, default_channel, sort_order)
select 'Weather or road note', 'weather', 'What changed, where it matters, and what readers should do next.', 'site', 10
where not exists (select 1 from public.quickshot_templates where name = 'Weather or road note');

insert into public.quickshot_templates (name, update_type, prompt, default_channel, sort_order)
select 'Ferry or travel update', 'travel', 'Route, time, impact, source, and next expected update.', 'site', 20
where not exists (select 1 from public.quickshot_templates where name = 'Ferry or travel update');

insert into public.quickshot_templates (name, update_type, prompt, default_channel, sort_order)
select 'Community notice', 'community', 'Who, what, when, where, and why it matters locally.', 'site', 30
where not exists (select 1 from public.quickshot_templates where name = 'Community notice');

insert into public.quickshot_posts (title, update_type, status, priority, channel, summary, body, owner, target_time, sort_order)
select 'Draft a quick local update', 'local_update', 'draft', 'normal', 'site', 'Use Quickshot for small updates that do not need a full article.', 'Keep it short, useful and easy to verify before publishing.', 'Admin / Editor', 'Today', 10
where not exists (select 1 from public.quickshot_posts where title = 'Draft a quick local update');
