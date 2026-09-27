-- HGN v0.67.2: Guide Manager, controlled review application and public Guide enrichment.
-- Additive only. Run after v299 in the Public HGN Supabase project.

alter table public.hgn_guide_places add column if not exists image_url text;

create table if not exists public.hgn_guide_change_log (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.hgn_guide_places(id) on delete cascade,
  finding_id uuid references public.hgn_guide_findings(id) on delete set null,
  action text not null,
  changed_by uuid references auth.users(id) on delete set null,
  before_data jsonb not null default '{}'::jsonb,
  after_data jsonb not null default '{}'::jsonb,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists hgn_guide_change_log_place_created_idx on public.hgn_guide_change_log(place_id, created_at desc);
alter table public.hgn_guide_change_log enable row level security;

drop policy if exists "HGN guide change log access" on public.hgn_guide_change_log;
create policy "HGN guide change log access" on public.hgn_guide_change_log for all to authenticated
  using (exists (select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or p.account_type in ('admin','publisher','editor'))))
  with check (exists (select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or p.account_type in ('admin','publisher','editor'))));
