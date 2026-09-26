-- HGN v0.66.9 — Island Lens photo features.
-- Public HGN only. Additive changes; preserves existing galleries and reader submissions.

alter table public.island_lens_items
  add column if not exists slug text,
  add column if not exists event_date date,
  add column if not exists issue_label text,
  add column if not exists issue_url text,
  add column if not exists cover_caption text,
  add column if not exists photo_captions jsonb not null default '[]'::jsonb,
  add column if not exists published_at timestamptz;

update public.island_lens_items
set slug = lower(regexp_replace(coalesce(nullif(title, ''), 'island-lens') || '-' || left(id::text, 8), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or btrim(slug) = '';

create unique index if not exists island_lens_items_slug_key
  on public.island_lens_items (slug)
  where slug is not null;

update public.island_lens_items
set published_at = coalesce(published_at, created_at)
where status in ('published', 'approved', 'public', 'live', 'active')
  and published_at is null;

-- Existing releases allowed any signed-in reader to manage editorial galleries.
-- Public reads remain public; editor access is restricted to publisher profiles.
drop policy if exists "island_lens_authenticated_manage" on public.island_lens_items;
drop policy if exists "Island Lens editors manage" on public.island_lens_items;
create policy "Island Lens editors manage" on public.island_lens_items
for all to authenticated
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

comment on column public.island_lens_items.photo_captions is
  'Ordered public photo metadata: URL, caption, credit and accessibility alt text.';

notify pgrst, 'reload schema';

-- Add the new public links to existing saved Community menus without replacing
-- any publisher customizations.
update public.hgn_site_platform_settings settings
set config = jsonb_set(config, '{navigation}', (
  select jsonb_agg(
    case when item->>'id' = 'community' then jsonb_set(item, '{children}',
      coalesce(item->'children', '[]'::jsonb) ||
      case when not (coalesce(item->'children', '[]'::jsonb) @> '[{"id":"island-lens"}]'::jsonb)
        then '[{"id":"island-lens","label":"Island Lens","href":"/island-lens","enabled":true,"visibility":"public"}]'::jsonb else '[]'::jsonb end ||
      case when not (coalesce(item->'children', '[]'::jsonb) @> '[{"id":"election"}]'::jsonb)
        then '[{"id":"election","label":"Election Guide","href":"/election","enabled":true,"visibility":"public"}]'::jsonb else '[]'::jsonb end
    ) else item end
  ) from jsonb_array_elements(config->'navigation') item
), true)
where config ? 'navigation'
  and exists (select 1 from jsonb_array_elements(config->'navigation') item where item->>'id' = 'community');
