-- HGN v0.52.2: newsletter reliability, build diagnostics and logged-in preferences
-- Safe additive migration. Run after v272.

alter table public.newsletter_editions
  add column if not exists build_diagnostics jsonb not null default '{}'::jsonb;

create table if not exists public.hgn_newsletter_test_sends (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid references public.newsletter_editions(id) on delete cascade,
  email text not null,
  status text not null default 'accepted' check (status in ('accepted','failed','delivered','bounced')),
  resend_email_id text,
  error_message text,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists hgn_newsletter_test_sends_created_idx on public.hgn_newsletter_test_sends(created_at desc);
create index if not exists hgn_newsletter_test_sends_edition_idx on public.hgn_newsletter_test_sends(edition_id);

alter table public.hgn_newsletter_test_sends enable row level security;

drop policy if exists "newsletter test sends publisher read" on public.hgn_newsletter_test_sends;
create policy "newsletter test sends publisher read" on public.hgn_newsletter_test_sends
for select to authenticated using (
  exists (
    select 1 from public.hgn_profiles p
    where p.user_id = auth.uid()
      and (
        p.is_admin = true or p.can_access_publisher_tools = true or
        lower(coalesce(p.account_type,'')) in ('admin','administrator','publisher','editor','newsroom','super_admin','superadmin') or
        lower(coalesce(p.admin_role,'')) in ('admin','administrator','publisher','editor','newsroom','super_admin','superadmin')
      )
  )
);
