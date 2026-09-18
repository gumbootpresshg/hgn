-- HGN v0.65.7 - Notices save/publish schema repair
-- Safe to rerun. Ensures the admin Notices API and public Notices page share one complete schema.

alter table public.notices add column if not exists title text;
alter table public.notices add column if not exists body text;
alter table public.notices add column if not exists message text;
alter table public.notices add column if not exists type text;
alter table public.notices add column if not exists category text default 'notice';
alter table public.notices add column if not exists town text;
alter table public.notices add column if not exists organization text;
alter table public.notices add column if not exists starts_at timestamptz;
alter table public.notices add column if not exists expires_at timestamptz;
alter table public.notices add column if not exists link_url text;
alter table public.notices add column if not exists attachment_url text;
alter table public.notices add column if not exists featured boolean default false;
alter table public.notices add column if not exists status text default 'pending';
alter table public.notices add column if not exists source text default 'website';
alter table public.notices add column if not exists requires_approval boolean default true;
alter table public.notices add column if not exists published_at timestamptz;
alter table public.notices add column if not exists created_at timestamptz default now();
alter table public.notices add column if not exists updated_at timestamptz default now();

update public.notices
set body = coalesce(body, message)
where body is null and message is not null;

update public.notices
set message = coalesce(message, body)
where message is null and body is not null;

update public.notices
set type = coalesce(type, category, 'Community')
where type is null;

update public.notices
set category = coalesce(category, type, 'notice')
where category is null;

update public.notices
set featured = false
where featured is null;

create index if not exists notices_status_created_idx on public.notices(status, created_at desc);
create index if not exists notices_expires_idx on public.notices(expires_at);
create index if not exists notices_published_idx on public.notices(status, published_at desc);
