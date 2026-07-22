begin;

create table if not exists public.hgn_site_theme_settings (
  singleton_key text primary key default 'default',
  preset text not null default 'island-newspaper',
  accent text not null default '#a31d24',
  secondary text not null default '#173f5f',
  paper text not null default '#fffefa',
  paper_muted text not null default '#f4f0e8',
  ink text not null default '#171717',
  muted text not null default '#665f57',
  rule text not null default '#b7b0a6',
  headline_font text not null default 'serif',
  body_font text not null default 'sans',
  density text not null default 'comfortable',
  masthead_style text not null default 'full',
  labels jsonb not null default '{}'::jsonb,
  draft_config jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.hgn_site_theme_history (
  id uuid primary key default gen_random_uuid(),
  preset text not null,
  config jsonb not null,
  created_by uuid null,
  created_at timestamptz not null default now()
);

insert into public.hgn_site_theme_settings (singleton_key, labels)
values ('default', '{"siteName":"Haida Gwaii News","tagline":"The Islands'' News Source Since 2024","news":"News","opinion":"Opinion","weather":"Weather","community":"Community","marketplace":"Marketplace","horoscopes":"Horoscopes","guide":"Haida Gwaii Guide","latestStories":"Latest Stories","events":"Events","support":"Support HGN","subscribe":"Subscribe"}'::jsonb)
on conflict (singleton_key) do nothing;

alter table public.hgn_site_theme_settings enable row level security;
alter table public.hgn_site_theme_history enable row level security;

drop policy if exists "public can read published theme" on public.hgn_site_theme_settings;
create policy "public can read published theme" on public.hgn_site_theme_settings for select using (is_published = true);

drop policy if exists "publishers manage theme" on public.hgn_site_theme_settings;
create policy "publishers manage theme" on public.hgn_site_theme_settings for all to authenticated using (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator'))
) with check (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator'))
);

drop policy if exists "publishers read theme history" on public.hgn_site_theme_history;
create policy "publishers read theme history" on public.hgn_site_theme_history for select to authenticated using (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator'))
);

drop policy if exists "publishers add theme history" on public.hgn_site_theme_history;
create policy "publishers add theme history" on public.hgn_site_theme_history for insert to authenticated with check (
  exists (select 1 from public.hgn_profiles p where p.user_id = auth.uid() and lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator'))
);

commit;
