-- HGN v0.49.1: dedicated front-page manager
-- Run in Supabase SQL Editor before deploying this release.

create table if not exists public.front_page_settings (
  id text primary key default 'current',
  lead_article_id uuid references public.articles(id) on delete set null,
  photo_url text,
  photo_thumbnail_url text,
  photo_caption text,
  photo_credit text,
  photo_alt text,
  related_article_id uuid references public.articles(id) on delete set null,
  display_starts_at timestamptz,
  display_expires_at timestamptz,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint front_page_settings_singleton check (id = 'current')
);

alter table public.front_page_settings enable row level security;

drop policy if exists "Public can read front page settings" on public.front_page_settings;
create policy "Public can read front page settings"
on public.front_page_settings for select
to anon, authenticated
using (true);

drop policy if exists "Editors can manage front page settings" on public.front_page_settings;
create policy "Editors can manage front page settings"
on public.front_page_settings for all
to authenticated
using (
  exists (
    select 1 from public.hgn_profiles p
    where p.user_id = auth.uid()
      and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type = 'admin')
  )
)
with check (
  exists (
    select 1 from public.hgn_profiles p
    where p.user_id = auth.uid()
      and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type = 'admin')
  )
);

insert into public.front_page_settings (id)
values ('current')
on conflict (id) do nothing;

comment on table public.front_page_settings is
  'Singleton controls for the homepage lead story and independent front-page photograph.';
