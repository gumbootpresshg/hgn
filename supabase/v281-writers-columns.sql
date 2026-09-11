-- HGN v0.61.4 - Writers and Columns
-- Public HGN Supabase project only. Additive and backward-compatible.

create table if not exists public.hgn_authors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  slug text not null,
  short_bio text,
  bio text,
  photo_url text,
  writer_type text not null default 'contributor',
  public_email text,
  website_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hgn_authors add column if not exists display_name text;
alter table public.hgn_authors add column if not exists slug text;
alter table public.hgn_authors add column if not exists short_bio text;
alter table public.hgn_authors add column if not exists bio text;
alter table public.hgn_authors add column if not exists photo_url text;
alter table public.hgn_authors add column if not exists writer_type text default 'contributor';
alter table public.hgn_authors add column if not exists public_email text;
alter table public.hgn_authors add column if not exists website_url text;
alter table public.hgn_authors add column if not exists is_active boolean default true;
alter table public.hgn_authors add column if not exists sort_order integer default 0;
alter table public.hgn_authors add column if not exists created_at timestamptz default now();
alter table public.hgn_authors add column if not exists updated_at timestamptz default now();

create unique index if not exists idx_hgn_authors_slug_unique on public.hgn_authors(slug);
create index if not exists idx_hgn_authors_active_sort on public.hgn_authors(is_active, sort_order, display_name);

-- Seed known bylines from the existing article archive so the new author dropdown is useful immediately.
insert into public.hgn_authors (display_name, slug, writer_type, is_active)
select distinct
  clean_name,
  left(trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g')), 120),
  case
    when lower(clean_name) in ('haida gwaii news', 'staff report') then 'staff'
    else 'contributor'
  end,
  true
from (
  select trim(coalesce(nullif(author_name, ''), nullif(author, ''))) as clean_name
  from public.articles
) existing
where clean_name is not null
  and clean_name <> ''
  and trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g')) <> ''
on conflict (slug) do nothing;

insert into public.hgn_authors (display_name, slug, writer_type, is_active, sort_order)
values
  ('Haida Gwaii News', 'haida-gwaii-news', 'staff', true, 0),
  ('Staff Report', 'staff-report', 'staff', true, 10)
on conflict (slug) do nothing;

alter table public.articles add column if not exists writer_id uuid references public.hgn_authors(id) on delete set null;
create index if not exists idx_articles_writer_id on public.articles(writer_id);

-- Backfill article writer links without changing historical byline text.
update public.articles a
set writer_id = w.id
from public.hgn_authors w
where a.writer_id is null
  and lower(trim(coalesce(nullif(a.author_name, ''), nullif(a.author, '')))) = lower(trim(w.display_name));

alter table public.columnists add column if not exists author_id uuid references public.hgn_authors(id) on delete set null;
alter table public.columnists add column if not exists bio text;
alter table public.columnists add column if not exists photo_url text;
create index if not exists idx_columnists_author_id on public.columnists(author_id);

-- Backfill existing column relationships when author_match already names a writer.
update public.columnists c
set author_id = w.id
from public.hgn_authors w
where c.author_id is null
  and c.author_match is not null
  and lower(trim(c.author_match)) = lower(trim(w.display_name));

alter table public.hgn_authors enable row level security;

drop policy if exists "hgn_authors_public_read_active" on public.hgn_authors;
create policy "hgn_authors_public_read_active"
on public.hgn_authors for select
to anon, authenticated
using (
  is_active = true
  or exists (
    select 1 from public.hgn_profiles p
    where p.user_id = auth.uid()
      and (p.is_admin = true or p.can_access_publisher_tools = true or lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator','editor','newsroom','super_admin','superadmin'))
  )
);

drop policy if exists "hgn_authors_authenticated_manage" on public.hgn_authors;
create policy "hgn_authors_authenticated_manage"
on public.hgn_authors for all
to authenticated
using (exists (
  select 1 from public.hgn_profiles p
  where p.user_id = auth.uid()
    and (p.is_admin = true or p.can_access_publisher_tools = true or lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator','editor','newsroom','super_admin','superadmin'))
))
with check (exists (
  select 1 from public.hgn_profiles p
  where p.user_id = auth.uid()
    and (p.is_admin = true or p.can_access_publisher_tools = true or lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator','editor','newsroom','super_admin','superadmin'))
));

-- Tighten the legacy columnists table so ordinary reader accounts cannot edit it.
drop policy if exists "columnists_authenticated_manage" on public.columnists;
create policy "columnists_authenticated_manage"
on public.columnists for all
to authenticated
using (exists (
  select 1 from public.hgn_profiles p
  where p.user_id = auth.uid()
    and (p.is_admin = true or p.can_access_publisher_tools = true or lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator','editor','newsroom','super_admin','superadmin'))
))
with check (exists (
  select 1 from public.hgn_profiles p
  where p.user_id = auth.uid()
    and (p.is_admin = true or p.can_access_publisher_tools = true or lower(coalesce(p.admin_role,p.account_type,'')) in ('publisher','admin','administrator','editor','newsroom','super_admin','superadmin'))
));
