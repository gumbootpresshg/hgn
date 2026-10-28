-- HGN obituary publishing repair: published entries must be publicly readable.
alter table public.obituaries add column if not exists published_at timestamptz;
alter table public.obituaries add column if not exists updated_at timestamptz default now();

drop policy if exists "Approved obituaries public" on public.obituaries;
drop policy if exists "obituaries_public_read" on public.obituaries;
create policy "obituaries_public_read" on public.obituaries for select to anon, authenticated
using (lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active'));

update public.obituaries set status = lower(status)
where lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active', 'publish')
  and status <> lower(status);
update public.obituaries set status = 'published', published_at = coalesce(published_at, updated_at, created_at, now())
where lower(coalesce(status, '')) = 'publish';
update public.obituaries set published_at = coalesce(published_at, updated_at, created_at, now())
where lower(coalesce(status, '')) in ('published', 'approved', 'public', 'live', 'active') and published_at is null;

create index if not exists obituaries_public_listing_idx on public.obituaries (status, published_at desc, created_at desc);
notify pgrst, 'reload schema';
