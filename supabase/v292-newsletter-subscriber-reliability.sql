-- HGN v0.66.0: canonical newsletter subscribers, welcome-email audit and protected admin access.
-- Additive and safe to rerun. Legacy audience_members/newsletter_subscribers tables are intentionally retained for history.
create table if not exists public.hgn_newsletter_welcome_sends (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references public.subscribers(id) on delete set null,
  email text not null,
  status text not null default 'queued' check (status in ('queued','accepted','failed','skipped')),
  resend_email_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists hgn_newsletter_welcome_sends_subscriber_idx on public.hgn_newsletter_welcome_sends(subscriber_id,created_at desc);
create index if not exists hgn_newsletter_welcome_sends_email_idx on public.hgn_newsletter_welcome_sends(lower(email),created_at desc);
alter table public.hgn_newsletter_welcome_sends enable row level security;
drop policy if exists "hgn newsletter welcome sends publisher read" on public.hgn_newsletter_welcome_sends;
create policy "hgn newsletter welcome sends publisher read" on public.hgn_newsletter_welcome_sends for select to authenticated
using (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true or lower(coalesce(p.account_type,'')) in ('admin','administrator','publisher','editor','newsroom','super_admin','superadmin'))));

-- Preserve older newsletter-only signups in the canonical delivery table without overwriting newer choices.
insert into public.subscribers (email,name,town,source,status,frequency,consent_source,newsletter_product_slugs,created_at,updated_at)
select lower(trim(email)), name, town, coalesce(source,'legacy_newsletter_subscribers'),
  case when lower(coalesce(status,'active')) in ('unsubscribed','inactive') then 'unsubscribed' else 'active' end,
  'biweekly', 'legacy_newsletter_subscribers', array['hgn-news'], coalesce(created_at,now()), now()
from public.newsletter_subscribers
where email is not null and trim(email) <> ''
on conflict (email) do nothing;

comment on table public.audience_members is 'Legacy audience list. Newsletter Publisher Suite uses public.subscribers as the canonical newsletter list.';
comment on table public.newsletter_subscribers is 'Legacy newsletter list. Newsletter Publisher Suite uses public.subscribers as the canonical newsletter list.';
