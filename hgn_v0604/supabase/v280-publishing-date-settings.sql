-- HGN v0.60.6 - central publishing date/time settings
create table if not exists public.hgn_publishing_settings (
  singleton_key text primary key default 'default',
  newsroom_timezone text not null default 'America/Vancouver',
  date_style text not null default 'medium' check (date_style in ('long','medium','iso')),
  time_style text not null default '12h' check (time_style in ('12h','24h')),
  updated_at timestamptz not null default now()
);

insert into public.hgn_publishing_settings (singleton_key, newsroom_timezone, date_style, time_style)
values ('default', 'America/Vancouver', 'medium', '12h')
on conflict (singleton_key) do nothing;

alter table public.hgn_publishing_settings enable row level security;

-- No anonymous write policy is added. Admin writes use the server-side service client after role verification.
