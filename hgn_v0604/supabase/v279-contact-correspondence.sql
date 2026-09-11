-- v279: Contact correspondence inbox and configurable notification routing.
-- Public HGN Supabase project only. Additive / non-destructive.

create table if not exists public.hgn_contact_settings (
  singleton_key text primary key default 'default',
  contact_form_enabled boolean not null default true,
  send_to_operations boolean not null default true,
  contact_email text,
  news_tips_email text,
  advertising_email text,
  subscriptions_email text,
  public_notices_email text,
  obituaries_email text,
  corrections_email text,
  letters_email text,
  updated_at timestamptz not null default now()
);

insert into public.hgn_contact_settings (
  singleton_key,
  contact_email,
  news_tips_email,
  advertising_email,
  subscriptions_email,
  public_notices_email,
  obituaries_email,
  corrections_email,
  letters_email
)
values (
  'default',
  'sales@haidagwaiinews.com',
  'sales@haidagwaiinews.com',
  'sales@haidagwaiinews.com',
  'sales@haidagwaiinews.com',
  'sales@haidagwaiinews.com',
  'sales@haidagwaiinews.com',
  'sales@haidagwaiinews.com',
  'sales@haidagwaiinews.com'
)
on conflict (singleton_key) do nothing;

alter table public.submission_inbox add column if not exists read_at timestamptz;
alter table public.submission_inbox add column if not exists archived_at timestamptz;
alter table public.submission_inbox add column if not exists assigned_to text;
alter table public.submission_inbox add column if not exists replied_at timestamptz;
alter table public.submission_inbox add column if not exists reply_count integer not null default 0;
alter table public.submission_inbox add column if not exists last_reply_subject text;

alter table public.hgn_contact_settings enable row level security;

-- No browser policies are added for hgn_contact_settings.
-- Settings are read and written only through publisher-authorized server routes using the service role.

create index if not exists idx_submission_inbox_contact_state
on public.submission_inbox (submission_type, archived_at, read_at, created_at desc);
