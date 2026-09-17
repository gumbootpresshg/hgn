alter table public.notices add column if not exists organization text;
alter table public.notices add column if not exists starts_at timestamptz;
alter table public.notices add column if not exists expires_at timestamptz;
alter table public.notices add column if not exists link_url text;
alter table public.notices add column if not exists attachment_url text;
alter table public.notices add column if not exists featured boolean default false;
alter table public.notices add column if not exists updated_at timestamptz default now();

update public.notices
set body = coalesce(body, message)
where body is null and message is not null;

update public.notices
set category = coalesce(category, type, 'notice')
where category is null;

create index if not exists notices_status_created_idx on public.notices(status, created_at desc);
create index if not exists notices_expires_idx on public.notices(expires_at);
